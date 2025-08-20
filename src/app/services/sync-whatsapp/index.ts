export async function checkExistingUser(phone: string): Promise<{ exists: boolean; count: number }> {
	const response = await fetch('/api/auth/check-existing-user', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ phone })
	});

	if (!response.ok) return { exists: false, count: 0 };
	const data = await response.json();
	return { exists: !!data.exists, count: data.count || 0 };
}

export async function sendVerificationCode(phone: string): Promise<{ error: any; data?: any }> {
	try {
		const response = await fetch('/api/auth/verify-phone/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phone })
		});

		if (response.ok) {
			const data = await response.json();
			return { error: null, data };
		}

		const error = await response.json();
		return { error: error.error || 'Erro ao enviar código' };
	} catch {
		return { error: 'Erro de conexão' };
	}
}

export async function verifyPhone(phone: string, code: string): Promise<{ error: any; data?: any }> {
	try {
		const response = await fetch('/api/auth/verify-phone/confirm', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phone, code })
		});

		if (response.ok) {
			const data = await response.json();
			return { error: null, data };
		}

		const error = await response.json();
		return { error: error.error || 'Erro na verificação' };
	} catch {
		return { error: 'Erro de conexão' };
	}
}

export async function syncUserWithDatabase(phone: string, shouldAssociate = true): Promise<{ error: any }> {
	try {
		const response = await fetch('/api/auth/sync-user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phone, shouldAssociate })
		});

		if (response.ok) {
			return { error: null };
		}

		const error = await response.json();
		return { error: error.error || 'Erro ao sincronizar' };
	} catch {
		return { error: 'Erro de conexão' };
	}
}