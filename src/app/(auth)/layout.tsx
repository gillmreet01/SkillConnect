export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16">{children}</main>;
}
