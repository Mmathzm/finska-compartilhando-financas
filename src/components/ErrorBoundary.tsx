import React from "react";

type State = { hasError: boolean; error?: Error | null; info?: React.ErrorInfo | null };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
    this.setState({ info });
    // Optionally, send this error to an external logging service like Sentry
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <div className="max-w-lg rounded-lg border p-6 shadow-lg bg-white dark:bg-slate-900 dark:border-slate-800">
            <h1 className="text-xl font-semibold mb-2">Algo deu errado</h1>
            <p className="mb-4">Ocorreu um erro inesperado na aplicação. Você pode tentar recarregar a página.</p>
            {this.state.error && (
              <details className="text-xs text-slate-500 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                <summary className="cursor-pointer">Ver detalhes do erro</summary>
                {this.state.error?.message}
                {this.state.info && this.state.info.componentStack && (
                  <div className="mt-2">{this.state.info.componentStack}</div>
                )}
              </details>
            )}
            <div className="flex gap-2">
              <button onClick={this.handleReload} className="px-3 py-2 rounded bg-blue-600 text-white">Recarregar</button>
              <button onClick={() => window.open('mailto:support@example.com?subject=Erro%20na%20aplicação')}
                className="px-3 py-2 rounded border">Reportar</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
