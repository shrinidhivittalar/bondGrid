export function ValidationMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-md bg-[#fff4ec] px-3 py-2 text-sm font-semibold text-[#f05200]">{message}</p>
  );
}
