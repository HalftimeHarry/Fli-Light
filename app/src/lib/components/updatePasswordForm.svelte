<!-- updatePasswordForm.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';

    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            alert('Password should be at least 8 characters long.');
            return;
        }

        dispatch('updatepassword', {
            currentPassword,
            newPassword
        });
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div>
        <label for="currentPassword">Current Password:</label>
        <input type="password" id="currentPassword" bind:value={currentPassword} required />
    </div>
    <div>
        <label for="newPassword">New Password:</label>
        <input type="password" id="newPassword" bind:value={newPassword} required />
    </div>
    <div>
        <label for="confirmPassword">Confirm New Password:</label>
        <input type="password" id="confirmPassword" bind:value={confirmPassword} required />
    </div>
    <div>
        <button type="submit">Update Password</button>
    </div>
</form>

<style>
    /* Add styles if needed */
    div {
        margin-bottom: 1rem;
    }
</style>
