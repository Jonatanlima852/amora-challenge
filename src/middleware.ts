import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set<string>([
	'/',
	'/auth/login',
	'/auth/register',
	'/auth/verify-email'
]);

const PROTECTED_PATHS = new Set<string>([
	'/app',
	'/broker'
]);

function isPublic(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	if (
		pathname.startsWith('/auth/') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/assets') ||
		pathname.startsWith('/public') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/api/')
	) return true;
	return false;
}

function isProtected(pathname: string) {
	const isProtected = PROTECTED_PATHS.has(pathname) || pathname.startsWith('/app/') || pathname.startsWith('/broker/');
	console.log(`🔍 isProtected(${pathname}): ${isProtected}`);
	return isProtected;
}

type AuthCookie = { 
  userId: string; 
  role: 'USER' | 'BROKER' | 'ADMIN';
  email: string;
  name: string;
  phoneE164?: string;
  verified: boolean;
};

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	
	console.log(`🚀 Middleware executando para: ${pathname}`);

	// Verifica se é uma rota protegida que requer autenticação
	if (isProtected(pathname)) {
		const raw = req.cookies.get('amora_auth')?.value;
		console.log(`🔒 Middleware: Rota protegida ${pathname}, Cookie:`, raw ? 'Presente' : 'Ausente');
		
		if (!raw) {
			console.log(`🚫 Middleware: Redirecionando para /auth/login`);
			const url = new URL('/auth/login', req.url);
			return NextResponse.redirect(url);
		}

		try {
			const auth = JSON.parse(raw) as AuthCookie;

			// Bloqueio de área do corretor
			if (pathname.startsWith('/broker') && auth.role !== 'BROKER' && auth.role !== 'ADMIN') {
				const url = new URL('/properties', req.url);
				return NextResponse.redirect(url);
			}

			return NextResponse.next();
		} catch {
			const url = new URL('/auth/login', req.url);
			return NextResponse.redirect(url);
		}
	}

	// Ignora recursos públicos e APIs
	if (isPublic(pathname)) {
		// Se já estiver logado e tentar ir para página pública de auth, redireciona para home correta
		const raw = req.cookies.get('amora_auth')?.value;
		if (raw && (pathname === '/' || pathname.startsWith('/auth'))) {
			try {
				const auth = JSON.parse(raw) as AuthCookie;
				const dest = auth.role === 'BROKER' || auth.role === 'ADMIN' ? '/broker' : '/properties';
				const url = new URL(dest, req.url);
				return NextResponse.redirect(url);
			} catch {
				// segue
			}
		}
		return NextResponse.next();
	}

	// Para outras rotas, permite acesso
	return NextResponse.next();
}

export const config = {
	// Aplica em todas as rotas exceto estáticos, assets e APIs
	matcher: [
		// Protege todas as rotas /app e /broker
		'/app/:path*',
		'/broker/:path*',
		// Protege rotas raiz específicas
		'/app',
		'/broker',
	]
};
