import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends (React.Component as any)<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: '',
  };

  /**
   * [PARCHE DEFENSIVO SEC-006]
   * Sanitizar el errorMessage antes de mostrarlo en la UI.
   * Evita inyección de HTML o Information Disclosure excesivo si en el futuro
   * se utiliza formato enriquecido. Trunca a 400 caracteres.
   */
  static getDerivedStateFromError(error: Error): State {
    const raw = error.message || 'Error inesperado en la aplicación.';
    const sanitized = raw.replace(/[<>"'&]/g, (c) => ({
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    }[c] || c));

    return {
      hasError: true,
      errorMessage: sanitized.slice(0, 400),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó una excepción:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if ((this.state as State).hasError) {
      return (
        <div className="min-h-screen bg-[#fff8f5] text-[#1e1b18] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-[#efe6e2] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ffdad6] text-[#ac2d00] flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[36px]">warning</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1e1b18]">Algo salió mal</h1>
            <p className="text-xs text-[#5b4139] leading-relaxed">
              Ocurrió un error inesperado en la aplicación. No te preocupes, tus datos en LocalStorage están a salvo.
            </p>
            {(this.state as State).errorMessage && (
              <div className="bg-[#fbf2ed] p-3 rounded-xl border border-[#e4beb4]/40 text-[11px] text-[#ac2d00] font-mono break-words">
                {(this.state as State).errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="bg-[#ac2d00] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-[#b02e00] transition-all cursor-pointer"
            >
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}
