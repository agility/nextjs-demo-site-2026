import { clsx } from 'clsx'

export function Container({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(className, 'px-6 lg:px-8')} {...props}>
      <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
    </div>
  )
}
