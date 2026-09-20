/**
 * 훈독의 점(あ.う)은 읽기가 둘이라는 뜻이 아니라 오쿠리가나 경계다.
 * 会う에서 한자가 맡는 건 あ 까지, う 는 히라가나로 붙는 부분.
 * 그래서 뒤쪽을 괄호로 묶어 흐리게 보여주고, 읽기끼리는 쉼표로 나눈다.
 */
export function Readings({ items }: { items: string[] }) {
  return (
    <span className="font-jp">
      {items.map((r, i) => {
        const [stem, okuri] = r.split(".");
        return (
          <span key={r}>
            {i > 0 && <span className="text-muted">, </span>}
            {stem}
            {okuri && <span className="text-muted">({okuri})</span>}
          </span>
        );
      })}
    </span>
  );
}
