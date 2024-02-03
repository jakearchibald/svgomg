export default function mapObject<InType, OutType>(
  object: { [s: string]: InType } | ArrayLike<InType>,
  mapper: (
    keyVal: [key: string, value: InType],
  ) => [key: string, value: OutType],
): { [s: string]: OutType } {
  return Object.fromEntries(
    Object.entries(object).map((keyVal) => mapper(keyVal)),
  );
}
