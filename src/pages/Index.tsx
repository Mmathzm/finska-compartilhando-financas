// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Finska</h1>
        <p className="text-xl text-muted-foreground">Organize suas finanças pessoais e compartilhadas com o Finska.</p>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/auth" className="px-4 py-2 rounded bg-blue-600 text-white">Entrar / Criar Conta</a>
          <a href="/app" className="px-4 py-2 rounded border">Ir para Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Index;
