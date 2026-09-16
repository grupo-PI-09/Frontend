import '../style/paginacao.css'

const MAX_BOTOES = 7

/**
 * Calcula quais números exibir. Até MAX_BOTOES páginas mostra todas;
 * acima disso mantém primeira, última e uma janela ao redor da atual,
 * com reticências nos saltos. Ex.: 1 … 5 6 7 … 47
 */
function calcularPaginas(paginaAtual, totalPaginas) {
    if (totalPaginas <= MAX_BOTOES) {
        return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    }

    const inicio = Math.max(2, Math.min(paginaAtual - 1, totalPaginas - 4))
    const fim = Math.min(totalPaginas - 1, Math.max(paginaAtual + 1, 5))

    // reticências só quando escondem mais de uma página
    const paginas = [1]
    if (inicio === 3) paginas.push(2)
    else if (inicio > 3) paginas.push('...')
    for (let p = inicio; p <= fim; p++) paginas.push(p)
    if (fim === totalPaginas - 2) paginas.push(totalPaginas - 1)
    else if (fim < totalPaginas - 2) paginas.push('...')
    paginas.push(totalPaginas)
    return paginas
}

export function Paginacao({ paginaAtual, totalPaginas, onChange }) {
    if (!totalPaginas || totalPaginas <= 1) {
        return null
    }

    const primeira = paginaAtual === 1
    const ultima = paginaAtual === totalPaginas

    return (
        <nav className="paginacao" aria-label="Paginação">
            <button
                type="button"
                className={`btn-pagina ${primeira ? 'desabilitado' : ''}`}
                onClick={() => onChange(Math.max(paginaAtual - 1, 1))}
                disabled={primeira}
                aria-label="Página anterior">‹</button>

            {calcularPaginas(paginaAtual, totalPaginas).map((pagina, indice) => (
                pagina === '...'
                    ? <span key={`reticencias-${indice}`} className="paginacao-reticencias" aria-hidden="true">…</span>
                    : (
                        <button
                            key={pagina}
                            type="button"
                            className={`btn-pagina ${paginaAtual === pagina ? 'ativo' : ''}`}
                            onClick={() => onChange(pagina)}
                            aria-current={paginaAtual === pagina ? 'page' : undefined}
                            aria-label={`Página ${pagina}`}>
                            {pagina}
                        </button>
                    )
            ))}

            <button
                type="button"
                className={`btn-pagina ${ultima ? 'desabilitado' : ''}`}
                onClick={() => onChange(Math.min(paginaAtual + 1, totalPaginas))}
                disabled={ultima}
                aria-label="Próxima página">›</button>
        </nav>
    )
}
