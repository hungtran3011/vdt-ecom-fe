import "@/app/globals.css";

export default function AuthLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <html lang="en" className="h-full">
            <body>
                {children}
            </body>
        </html>
    );
}