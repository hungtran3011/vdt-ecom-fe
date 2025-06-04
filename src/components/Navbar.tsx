"use client"

import Image from "next/image";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Button from "./Button";
import { useState } from "react";
import SearchBox from "./SearchBox";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { isAdmin } from "@/utils/roleCheck";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    console.log('Session:', session);

    const handleSignOut = async () => {
        try {
            // If we have an ID token, logout from Keycloak directly
            if (session?.idToken) {
                const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
                
                // Clear NextAuth session first
                await signOut({ redirect: false });
                
                // Then redirect to Keycloak logout
                window.location.href = keycloakLogoutUrl;
            } else {
                // Fallback to normal NextAuth logout
                await signOut({ 
                    callbackUrl: '/',
                    redirect: true 
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback logout
            await signOut({ 
                callbackUrl: '/',
                redirect: true 
            });
        }
    };

    const renderAuthSection = () => {
        if (status === "loading") {
            return (
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded hidden sm:flex"></div>
            );
        }

        if (session) {
            return (
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-(--md-sys-color-on-surface) max-w-32 truncate">
                        Xin chào, {session.user?.name || session.user?.email}
                    </span>
                    <Button 
                        variant="outlined" 
                        label="Đăng xuất"
                        onClick={handleSignOut}
                        className="text-xs"
                    />
                </div>
            );
        }

        return (
            <Button 
                variant="filled" 
                className="bg-yellow-800 hidden sm:flex"
                onClick={() => router.push('/login')}
                label="Đăng nhập / Đăng ký"
            >
            </Button>
        );
    };

    const renderMobileAuthSection = () => {
        if (status === "loading") {
            return (
                <div className="w-full h-10 bg-gray-200 animate-pulse rounded mt-4"></div>
            );
        }

        if (session) {
            return (
                <div className="mt-4 p-3 bg-(--md-sys-color-surface-container) rounded">
                    <div className="text-sm text-(--md-sys-color-on-surface) mb-2">
                        Xin chào, {session.user?.name || session.user?.email}
                    </div>
                    <Button 
                        variant="outlined" 
                        label="Đăng xuất"
                        onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                        }}
                        className="w-full"
                    />
                </div>
            );
        }

        return (
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button 
                    variant="filled" 
                    label="Đăng nhập / Đăng ký"
                    className="bg-yellow-800 mt-4 w-full"
                />
            </Link>
        );
    };

    const renderAdminLink = () => {
        if (session && isAdmin(session)) {
            return (
                <Link 
                    href="/admin" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    Admin
                </Link>
            );
        }
        return null;
    };

    return (
        <div className="self-stretch h-16 px-2 inline-flex justify-between items-center overflow-hidden gap-2 relative flex-1 w-full">
            <div className="flex justify-center items-center gap-2">
                <Image alt="logo" className="w-9 h-9" src="https://placehold.co/36x36" width={36} height={36} />
                
                {/* Hamburger menu button - visible only on small screens */}
                <button 
                    className="md:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <span className="mdi w-6 h-6 text-(--md-sys-on-background)">close</span>
                    ) : (
                        <span className="mdi w-6 h-6 text-(--md-sys-on-background)">menu</span>
                    )}
                </button>
                
                {/* Desktop navigation - hidden on small screens */}
                <NavigationMenu.Root className="hidden md:flex h-10 p-1 rounded-md justify-start items-start overflow-hidden">
                    <NavigationMenu.List className="self-stretch flex justify-center items-center">
                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/" className="self-stretch px-3 py-2 bg-white/0 rounded flex justify-center items-center gap-1">
                                    <span className="justify-center text-(--md-sys-on-background) text-xs leading-normal">
                                        Trang chủ
                                    </span>
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        
                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/products" className="self-stretch px-3 py-2 bg-white/0 rounded flex justify-center items-center gap-[5px]">
                                    <span className="justify-center text-(--md-sys-color-on-background) text-xs font-medium leading-normal">
                                        Sản phẩm
                                    </span>
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        
                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/about" className="self-stretch px-3 py-2 bg-white/0 rounded flex justify-center items-center gap-[5px]">
                                    <span className="justify-center text-(--md-sys-color-on-background) text-xs font-medium leading-normal">
                                        Về chúng tôi
                                    </span>
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        
                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/support" className="self-stretch px-3 py-2 bg-white/0 rounded flex justify-center items-center gap-[5px]">
                                    <span className="justify-center text-(--md-sys-color-on-background) text-xs font-medium leading-normal">
                                        Hỗ trợ
                                    </span>
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        {renderAdminLink()}
                    </NavigationMenu.List>
                    
                    <NavigationMenu.Viewport />
                </NavigationMenu.Root>
            </div>
            
            <SearchBox className="flex-1"/>

            {/* Desktop auth section */}
            {renderAuthSection()}
            
            {/* Mobile menu overlay - visible when menu is open */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-(--md-sys-color-surface) z-50 shadow-lg md:hidden">
                    <div className="flex flex-col p-4">
                        <Link 
                            href="/" 
                            className="px-4 py-3 text-(--md-sys-on-background) hover:bg-(--md-sys-color-surface-container)"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>
                        <Link 
                            href="/products" 
                            className="px-4 py-3 text-(--md-sys-on-background) hover:bg-(--md-sys-color-surface-container)"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sản phẩm
                        </Link>
                        <Link 
                            href="/about" 
                            className="px-4 py-3 text-(--md-sys-on-background) hover:bg-(--md-sys-color-surface-container)"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Về chúng tôi
                        </Link>
                        <Link 
                            href="/support" 
                            className="px-4 py-3 text-(--md-sys-on-background) hover:bg-(--md-sys-color-surface-container)"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hỗ trợ
                        </Link>
                        
                        {/* Mobile search - visible only in mobile menu */}
                        <div className="mt-4 p-1 bg-(--md-sys-color-surface-container-lowest) rounded-md outline-1 outline-offset-[-1px] outline-(--md-sys-color-outline) flex justify-between items-center overflow-hidden">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full h-6 px-2.5 bg-transparent border-none outline-none text-(--md-sys-color-on-surface) text-xs font-normal leading-tight"
                            />
                            <span className="mdi w-5 h-5 text-(--md-sys-color-on-surface) mr-2">search</span>
                        </div>
                        
                        {/* Mobile auth section */}
                        {renderMobileAuthSection()}
                    </div>
                </div>
            )}
        </div>
    );
}