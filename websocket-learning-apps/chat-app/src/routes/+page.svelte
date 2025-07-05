<!-- Main page - login or chat -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { AuthStore } from '$lib/stores/auth.svelte';
	import ChatRoom from '$lib/components/ChatRoom.svelte';

	const authStore = new AuthStore();

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let isRegistering = $state(false);
	let isLoggingIn = $state(false);
	let error = $state('');

	onMount(() => {
		authStore.init();
	});

	async function handleLogin() {
		if (!email.trim() || !password.trim()) {
			error = 'Please enter both email and password';
			return;
		}

		isLoggingIn = true;
		error = '';

		try {
			const success = await authStore.login(email, password);
			if (!success) {
				error = 'Login failed. Please check your credentials.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Login failed. Please try again.';
		} finally {
			isLoggingIn = false;
		}
	}

	async function handleRegister() {
		if (!username.trim() || !email.trim() || !password.trim()) {
			error = 'Please fill in all fields';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			return;
		}

		isLoggingIn = true;
		error = '';

		try {
			const success = await authStore.register(username, email, password);
			if (!success) {
				error = 'Registration failed. Please try again.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Registration failed. Please try again.';
		} finally {
			isLoggingIn = false;
		}
	}

	function handleLogout() {
		authStore.logout();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (isRegistering) {
				handleRegister();
			} else {
				handleLogin();
			}
		}
	}
</script>

<svelte:head>
	<title>WebSocket Chat App</title>
</svelte:head>

{#if authStore.isAuthenticated && authStore.user && authStore.token}
	<!-- Chat interface -->
	<div class="h-screen">
		<ChatRoom token={authStore.token} wsUrl="ws://localhost:8080" />

		<!-- Logout button -->
		<button
			onclick={handleLogout}
			class="fixed top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors z-10"
		>
			Logout
		</button>
	</div>
{:else}
	<!-- Login form -->
	<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-md w-full space-y-8">
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
					{isRegistering ? 'Create Account' : 'Welcome Back'}
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					{isRegistering ? 'Sign up to start chatting' : 'Sign in to your account'}
				</p>
			</div>

			<div class="mt-8 space-y-6">
				<div class="space-y-4">
					{#if isRegistering}
						<div>
							<label for="username" class="block text-sm font-medium text-gray-700">
								Username
							</label>
							<input
								id="username"
								type="text"
								bind:value={username}
								onkeypress={handleKeyPress}
								disabled={isLoggingIn}
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
								placeholder="Enter your username"
								required
							/>
						</div>
					{/if}

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
						<input
							id="email"
							type="email"
							bind:value={email}
							onkeypress={handleKeyPress}
							disabled={isLoggingIn}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
							placeholder="Enter your email"
							required
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
						<input
							id="password"
							type="password"
							bind:value={password}
							onkeypress={handleKeyPress}
							disabled={isLoggingIn}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
							placeholder="Enter your password"
							required
						/>
					</div>
				</div>

				{#if error}
					<div class="text-red-600 text-sm text-center">
						{error}
					</div>
				{/if}

				<div>
					<button
						onclick={isRegistering ? handleRegister : handleLogin}
						disabled={isLoggingIn ||
							!email.trim() ||
							!password.trim() ||
							(isRegistering && !username.trim())}
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					>
						{#if isLoggingIn}
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							{isRegistering ? 'Creating Account...' : 'Signing In...'}
						{:else}
							{isRegistering ? 'Create Account' : 'Sign In'}
						{/if}
					</button>
				</div>

				<div class="text-center">
					<button
						type="button"
						onclick={() => {
							isRegistering = !isRegistering;
							error = '';
							username = '';
							email = '';
							password = '';
						}}
						class="text-sm text-blue-600 hover:text-blue-500 transition-colors"
					>
						{isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
					</button>
				</div>
			</div>

			<div class="text-center text-sm text-gray-500">
				<p>This is a demo WebSocket chat application.</p>
				<p>Your data is stored locally and not persistent.</p>
			</div>
		</div>
	</div>
{/if}
