export function TypographyH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  )
}

export function TypographyH4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  )
}


export function TypographyLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xl text-muted-foreground">
      {children}
    </p>
  )
}

export function TypographyMuted({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium">
      {children}
    </p>
  )
}
