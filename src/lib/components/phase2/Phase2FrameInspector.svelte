<script lang="ts">
  import type { WebSocketFrame, FrameStructureNode } from '$lib/types/websocket';
  import { WEBSOCKET_OPCODES } from '$lib/types/websocket';

  interface Props {
    frame: WebSocketFrame | null;
    showHexDump?: boolean;
    showStructureTree?: boolean;
  }

  let { frame, showHexDump = true, showStructureTree = true }: Props = $props();

  // Frame structure analysis
  let frameStructure = $derived.by(() => {
    if (!frame) return null;
    return analyzeFrameStructure(frame);
  });

  function analyzeFrameStructure(frame: WebSocketFrame): FrameStructureNode[] {
    const structure: FrameStructureNode[] = [];

    // WebSocket frame header analysis
    structure.push({
      name: 'WebSocket Frame Header',
      type: 'header',
      offset: 0,
      length: 2, // Minimum header length
      value: '',
      description: 'WebSocket frame header containing control bits and opcode',
      children: [
        {
          name: 'FIN',
          type: 'field',
          offset: 0,
          length: 1,
          value: frame.details.fin,
          description: 'Final fragment flag'
        },
        {
          name: 'RSV1',
          type: 'field',
          offset: 0,
          length: 1,
          value: frame.details.rsv1,
          description: 'Reserved bit 1 (must be 0 unless extension defines use)'
        },
        {
          name: 'RSV2',
          type: 'field',
          offset: 0,
          length: 1,
          value: frame.details.rsv2,
          description: 'Reserved bit 2 (must be 0 unless extension defines use)'
        },
        {
          name: 'RSV3',
          type: 'field',
          offset: 0,
          length: 1,
          value: frame.details.rsv3,
          description: 'Reserved bit 3 (must be 0 unless extension defines use)'
        },
        {
          name: 'Opcode',
          type: 'field',
          offset: 0,
          length: 4,
          value: `0x${frame.details.opcode.toString(16).toUpperCase()}`,
          description: `Frame type: ${WEBSOCKET_OPCODES[frame.details.opcode as keyof typeof WEBSOCKET_OPCODES] || 'Unknown'}`
        },
        {
          name: 'MASK',
          type: 'field',
          offset: 1,
          length: 1,
          value: frame.details.masked,
          description: 'Masking flag (1 for client-to-server frames)'
        },
        {
          name: 'Payload Length',
          type: 'field',
          offset: 1,
          length: 7,
          value: frame.details.payloadLength,
          description: 'Length of payload data in bytes'
        }
      ]
    });

    // Masking key (if present)
    if (frame.details.masked && frame.details.maskingKey) {
      structure.push({
        name: 'Masking Key',
        type: 'header',
        offset: 2,
        length: 4,
        value: frame.details.maskingKey
          .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
          .join(' '),
        description: '32-bit masking key used to mask payload data'
      });
    }

    // Payload analysis
    if (frame.data) {
      const payloadOffset = 2 + (frame.details.masked ? 4 : 0);

      if (frame.type === 'binary') {
        structure.push(analyzeBinaryPayload(frame, payloadOffset));
      } else if (frame.type === 'text') {
        structure.push(analyzeTextPayload(frame, payloadOffset));
      } else if (frame.type === 'close') {
        structure.push(analyzeClosePayload(frame, payloadOffset));
      } else {
        structure.push({
          name: 'Payload',
          type: 'payload',
          offset: payloadOffset,
          length: frame.size - payloadOffset,
          value: `${frame.size - payloadOffset} bytes`,
          description: `${frame.type} frame payload data`
        });
      }
    }

    return structure;
  }

  function analyzeBinaryPayload(frame: WebSocketFrame, offset: number): FrameStructureNode {
    const data = frame.data as ArrayBuffer;
    const view = new Uint8Array(data);

    const children: FrameStructureNode[] = [];

    // Protocol-specific analysis
    if (frame.protocolInfo) {
      if ('messageType' in frame.protocolInfo && frame.protocolInfo.messageType) {
        // MQTT analysis
        if (
          frame.protocolInfo.messageType.match(
            /^(CONNECT|CONNACK|PUBLISH|PUBACK|SUBSCRIBE|SUBACK|UNSUBSCRIBE|UNSUBACK|PINGREQ|PINGRESP|DISCONNECT)$/
          )
        ) {
          children.push(...analyzeMQTTPayload(view));
        }
      }
    }

    // Generic binary analysis if no protocol-specific analysis
    if (children.length === 0) {
      children.push({
        name: 'Binary Data',
        type: 'value',
        offset: 0,
        length: view.length,
        value: Array.from(view)
          .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
          .join(' '),
        description: `${view.length} bytes of binary data`
      });
    }

    return {
      name: 'Binary Payload',
      type: 'payload',
      offset,
      length: data.byteLength,
      value: `${data.byteLength} bytes`,
      description: 'Binary payload data',
      children
    };
  }

  function analyzeTextPayload(frame: WebSocketFrame, offset: number): FrameStructureNode {
    const text = frame.data as string;
    const children: FrameStructureNode[] = [];

    // Try to parse as JSON for protocol analysis
    try {
      const parsed = JSON.parse(text);

      // GraphQL-WS analysis
      if (parsed.type && typeof parsed.type === 'string') {
        children.push({
          name: 'Message Type',
          type: 'field',
          offset: 0,
          length: 0,
          value: parsed.type,
          description: 'GraphQL-WS message type'
        });

        if (parsed.id) {
          children.push({
            name: 'Message ID',
            type: 'field',
            offset: 0,
            length: 0,
            value: parsed.id,
            description: 'GraphQL-WS message identifier'
          });
        }

        if (parsed.payload) {
          children.push({
            name: 'Payload',
            type: 'value',
            offset: 0,
            length: 0,
            value: JSON.stringify(parsed.payload, null, 2),
            description: 'GraphQL-WS message payload'
          });
        }
      }
    } catch {
      // Not JSON, treat as plain text
      children.push({
        name: 'Text Content',
        type: 'value',
        offset: 0,
        length: text.length,
        value: text,
        description: 'Plain text content'
      });
    }

    return {
      name: 'Text Payload',
      type: 'payload',
      offset,
      length: text.length,
      value: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      description: 'UTF-8 text payload',
      children
    };
  }

  function analyzeClosePayload(frame: WebSocketFrame, offset: number): FrameStructureNode {
    // Close frame analysis would go here
    return {
      name: 'Close Payload',
      type: 'payload',
      offset,
      length: frame.size - offset,
      value: 'Close frame',
      description: 'WebSocket close frame payload'
    };
  }

  function analyzeMQTTPayload(data: Uint8Array): FrameStructureNode[] {
    if (data.length === 0) return [];

    const nodes: FrameStructureNode[] = [];
    const firstByte = data[0];
    const messageType = (firstByte >> 4) & 0x0f;
    const flags = firstByte & 0x0f;

    nodes.push({
      name: 'MQTT Fixed Header',
      type: 'header',
      offset: 0,
      length: 1,
      value: `0x${firstByte.toString(16).padStart(2, '0').toUpperCase()}`,
      description: 'MQTT message type and flags',
      children: [
        {
          name: 'Message Type',
          type: 'field',
          offset: 0,
          length: 4,
          value: messageType,
          description: getMQTTMessageTypeName(messageType)
        },
        {
          name: 'Flags',
          type: 'field',
          offset: 0,
          length: 4,
          value: `0x${flags.toString(16).toUpperCase()}`,
          description: 'Message-specific flags'
        }
      ]
    });

    // Remaining length
    if (data.length > 1) {
      nodes.push({
        name: 'Remaining Length',
        type: 'field',
        offset: 1,
        length: 1,
        value: data[1],
        description: 'Length of variable header + payload'
      });
    }

    return nodes;
  }

  function getMQTTMessageTypeName(type: number): string {
    const types = {
      1: 'CONNECT',
      2: 'CONNACK',
      3: 'PUBLISH',
      4: 'PUBACK',
      5: 'PUBREC',
      6: 'PUBREL',
      7: 'PUBCOMP',
      8: 'SUBSCRIBE',
      9: 'SUBACK',
      10: 'UNSUBSCRIBE',
      11: 'UNSUBACK',
      12: 'PINGREQ',
      13: 'PINGRESP',
      14: 'DISCONNECT'
    };
    return types[type as keyof typeof types] || 'UNKNOWN';
  }

  function generateHexDump(frame: WebSocketFrame): string {
    if (!frame.data) return '';

    let data: Uint8Array;
    if (frame.type === 'binary') {
      data = new Uint8Array(frame.data as ArrayBuffer);
    } else {
      const encoder = new TextEncoder();
      data = encoder.encode(frame.data as string);
    }

    const lines: string[] = [];
    for (let i = 0; i < data.length; i += 16) {
      const chunk = data.slice(i, i + 16);
      const hex = Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ')
        .padEnd(47, ' '); // 16 bytes * 3 chars - 1

      const ascii = Array.from(chunk)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');

      const offset = i.toString(16).padStart(8, '0').toUpperCase();
      lines.push(`${offset}  ${hex}  |${ascii}|`);
    }

    return lines.join('\n');
  }

  function getTypeIcon(type: string): string {
    switch (type) {
      case 'header':
        return '📋';
      case 'payload':
        return '📦';
      case 'field':
        return '🔧';
      case 'value':
        return '📄';
      default:
        return '❓';
    }
  }

  function getFrameTypeColor(frameType: string): string {
    switch (frameType) {
      case 'text':
        return 'text-green-700 bg-green-50';
      case 'binary':
        return 'text-blue-700 bg-blue-50';
      case 'ping':
        return 'text-yellow-700 bg-yellow-50';
      case 'pong':
        return 'text-yellow-700 bg-yellow-50';
      case 'close':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg">
  <!-- Header -->
  <div class="border-b border-gray-200 p-4">
    <h3 class="text-lg font-semibold text-gray-900">🔍 Frame Inspector</h3>
    {#if frame}
      <div class="mt-2 flex items-center space-x-4 text-sm">
        <span
          class="inline-flex items-center px-2 py-1 rounded-md font-medium {getFrameTypeColor(
            frame.type
          )}"
        >
          {frame.type.toUpperCase()}
        </span>
        <span class="text-gray-600">
          {frame.direction === 'outbound' ? '📤 Outbound' : '📥 Inbound'}
        </span>
        <span class="text-gray-600">
          {frame.size} bytes
        </span>
        <span class="text-gray-600">
          {new Date(frame.timestamp).toLocaleTimeString()}
        </span>
      </div>
    {/if}
  </div>

  {#if frame}
    <div class="p-4 space-y-6">
      <!-- Frame Overview -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-3">Frame Overview</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Opcode:</span>
            <div class="mt-1 font-mono">
              0x{frame.details.opcode.toString(16).toUpperCase()}
              <span class="text-gray-500 ml-2">
                ({WEBSOCKET_OPCODES[frame.details.opcode as keyof typeof WEBSOCKET_OPCODES] ||
                  'Unknown'})
              </span>
            </div>
          </div>
          <div>
            <span class="font-medium text-gray-600">FIN:</span>
            <div class="mt-1">{frame.details.fin ? 'True' : 'False'}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Masked:</span>
            <div class="mt-1">{frame.details.masked ? 'True' : 'False'}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Payload Length:</span>
            <div class="mt-1">{frame.details.payloadLength} bytes</div>
          </div>
        </div>

        {#if frame.details.maskingKey}
          <div class="mt-3">
            <span class="font-medium text-gray-600">Masking Key:</span>
            <div class="mt-1 font-mono text-sm">
              {frame.details.maskingKey
                .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
                .join(' ')}
            </div>
          </div>
        {/if}
      </div>

      <!-- Protocol Information -->
      {#if frame.protocolInfo}
        <div class="bg-purple-50 rounded-lg p-4">
          <h4 class="font-medium text-purple-900 mb-3">Protocol Information</h4>
          <div class="text-sm">
            {#if 'messageType' in frame.protocolInfo}
              <div class="mb-2">
                <span class="font-medium text-purple-700">Message Type:</span>
                <span
                  class="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                >
                  {frame.protocolInfo.messageType}
                </span>
              </div>
            {/if}

            {#if frame.protocolInfo && 'subscriptionId' in frame.protocolInfo && frame.protocolInfo.subscriptionId}
              <div class="mb-2">
                <span class="font-medium text-purple-700">Subscription ID:</span>
                <span class="ml-2 font-mono">{frame.protocolInfo.subscriptionId}</span>
              </div>
            {/if}

            {#if frame.protocolInfo && 'topic' in frame.protocolInfo && frame.protocolInfo.topic}
              <div class="mb-2">
                <span class="font-medium text-purple-700">MQTT Topic:</span>
                <span class="ml-2 font-mono">{frame.protocolInfo.topic}</span>
              </div>
            {/if}

            {#if frame.protocolInfo && 'qos' in frame.protocolInfo && frame.protocolInfo.qos !== undefined}
              <div class="mb-2">
                <span class="font-medium text-purple-700">QoS Level:</span>
                <span class="ml-2">{frame.protocolInfo.qos}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Frame Structure Tree -->
      {#if showStructureTree && frameStructure}
        <div class="bg-white border border-gray-200 rounded-lg">
          <h4 class="font-medium text-gray-900 p-3 border-b border-gray-200">🌳 Frame Structure</h4>
          <div class="p-3">
            {#if frameStructure}
              {#each frameStructure as node (node.name + node.offset)}
                <div class="frame-structure-node">
                  {@render FrameStructureNode({ node, depth: 0 })}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}

      <!-- Hex Dump -->
      {#if showHexDump}
        <div class="bg-white border border-gray-200 rounded-lg">
          <h4 class="font-medium text-gray-900 p-3 border-b border-gray-200">🔢 Hex Dump</h4>
          <div class="p-3">
            <pre
              class="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">{generateHexDump(
                frame
              )}</pre>
          </div>
        </div>
      {/if}

      <!-- Raw Data -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <h4 class="font-medium text-gray-900 p-3 border-b border-gray-200">📄 Raw Data</h4>
        <div class="p-3">
          {#if frame.type === 'binary'}
            <div class="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
              {Array.from(new Uint8Array(frame.data as ArrayBuffer))
                .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
                .join(' ')}
            </div>
          {:else}
            <div
              class="text-sm text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap"
            >
              {frame.data}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="p-8 text-center text-gray-500">
      <div class="text-4xl mb-4">🔍</div>
      <p>Select a frame from the analyzer to inspect its structure</p>
      <p class="text-sm mt-2">Detailed frame analysis will be displayed here</p>
    </div>
  {/if}
</div>

<!-- Frame Structure Node Component -->
{#snippet FrameStructureNode({ node, depth }: { node: FrameStructureNode; depth: number })}
  <div class="ml-{depth * 4} py-1">
    <div class="flex items-center space-x-2">
      <span class="text-lg">{getTypeIcon(node.type)}</span>
      <span class="font-medium text-gray-900">{node.name}</span>
      <span class="text-xs text-gray-500">
        (offset: {node.offset}, length: {node.length})
      </span>
    </div>

    <div class="ml-6 text-sm text-gray-700">
      <div class="font-mono text-blue-600">{node.value}</div>
      <div class="text-gray-600 text-xs">{node.description}</div>
    </div>

    {#if node.children}
      {#each node.children as child (child.name + child.offset)}
        {@render FrameStructureNode({ node: child, depth: depth + 1 })}
      {/each}
    {/if}
  </div>
{/snippet}

<style>
  .frame-structure-node {
    border-left: 1px solid #e5e7eb;
    padding-left: 0.5rem;
    margin-left: 0.5rem;
  }
</style>
