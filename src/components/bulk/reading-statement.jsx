export function ReadingStatement() {
  return (
    <p className="statement story-reading">
      <span className="sr-only">
        Some things fill a space. Others change how it feels.
      </span>
      <span aria-hidden="true">
        {'Some things fill a space.'.split(' ').map((word, i) => (
          <span className="reading-word" key={i}>
            {word}{' '}
          </span>
        ))}
      </span>
      <br />
      <em aria-hidden="true">
        {'Others change how it feels.'.split(' ').map((word, i) => (
          <span className="reading-word" key={i}>
            {word}{' '}
          </span>
        ))}
      </em>
    </p>
  )
}
