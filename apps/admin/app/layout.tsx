import { Toaster } from "@workspace/ui/components/sonner"
import "@workspace/ui/globals.css"

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "#171A15",
                            color: "#F7F5F0",
                            border: "1px solid #284226",
                            borderRadius: "4px",
                        },
                    }}
                />
                {children}
            </body>
        </html>
    )
}
