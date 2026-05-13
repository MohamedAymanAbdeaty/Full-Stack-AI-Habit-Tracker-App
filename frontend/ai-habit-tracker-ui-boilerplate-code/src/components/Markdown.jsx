import ReactMarkdown from "react-markdown";

const components = {
  p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  ul: (props) => (
    <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  h1: (props) => (
    <h3 className="font-semibold text-base mt-3 mb-1" {...props} />
  ),
  h2: (props) => (
    <h3 className="font-semibold text-base mt-3 mb-1" {...props} />
  ),
  h3: (props) => (
    <h3 className="font-semibold text-base mt-3 mb-1" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-brand-500/40 pl-3 my-2 italic text-soft"
      {...props}
    />
  ),
  code: ({ inline, ...props }) =>
    inline ? (
      <code
        className="px-1.5 py-0.5 rounded text-[0.85em] font-mono"
        style={{ background: "var(--chip-bg)" }}
        {...props}
      />
    ) : (
      <code
        className="block rounded-lg p-3 text-[0.85em] font-mono overflow-x-auto"
        style={{ background: "var(--chip-bg)" }}
        {...props}
      />
    ),
  a: ({ href, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-brand-700 dark:text-brand-300 underline underline-offset-2"
      {...rest}
    />
  ),
  hr: () => <hr className="my-3 divider" />,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{children || ""}</ReactMarkdown>
    </div>
  );
}
