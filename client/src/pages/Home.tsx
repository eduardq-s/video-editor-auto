import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video, Zap, Sparkles, ArrowRight } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Video className="text-blue-500" size={28} />
            <span className="text-2xl font-bold text-white">{APP_TITLE}</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-slate-300">Olá, {user?.name || "Usuário"}!</span>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Edição Automática de Vídeos</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Transforme seus vídeos com IA. Corte, adicione legendas, remova silêncios e aplique filtros automaticamente.
        </p>
        {isAuthenticated ? (
          <Link href="/editor">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Começar a Editar
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Entrar para Começar
            <ArrowRight className="ml-2" size={20} />
          </Button>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Zap className="text-yellow-500 mb-2" size={32} />
              <CardTitle className="text-white">Corte Automático</CardTitle>
              <CardDescription>Corte e trimme seus vídeos com precisão</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Defina pontos de início e fim para criar vídeos perfeitos para redes sociais.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Sparkles className="text-purple-500 mb-2" size={32} />
              <CardTitle className="text-white">Legendas com IA</CardTitle>
              <CardDescription>Gere legendas automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Transcrição automática de áudio e geração de legendas em múltiplos idiomas.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Video className="text-blue-500 mb-2" size={32} />
              <CardTitle className="text-white">Filtros e Efeitos</CardTitle>
              <CardDescription>Aplique efeitos profissionais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Grayscale, desfoque, brilho, contraste e muito mais.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Remoção de Silêncios</CardTitle>
              <CardDescription>Otimize o tempo de visualização</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Remove automaticamente pausas e silêncios do seu vídeo, mantendo sincronização perfeita.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Junção de Vídeos</CardTitle>
              <CardDescription>Combine múltiplos clipes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Junte vários vídeos em um único arquivo otimizado para suas redes sociais favoritas.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      {isAuthenticated && (
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="pt-12 pb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h3>
              <p className="text-blue-100 mb-8">Faça upload do seu primeiro vídeo e deixe a IA fazer a magia!</p>
              <Link href="/editor">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                  Ir para o Editor
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-400">
          <p>&copy; 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
