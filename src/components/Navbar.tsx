"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "./Button";
import IconButton from "./IconButton";
import SearchBox from "./SearchBox";
import { useSession, signOut } from "next-auth/react";
// import { useSession } from "@/hooks/useSessionDebug"; // Debug version - temporarily disabled
import { useRouter } from 'next/navigation';
import { isAdmin } from "@/utils/roleCheck";
import { useCartContext } from "@/contexts/CartContext";
// import { useSessionHealth } from "@/hooks/useSessionHealth"; // Temporarily disabled

export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { getCartItemCount } = useCartContext();
    // const sessionHealth = useSessionHealth(); // Temporarily disabled

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
                <div className="w-20 h-8 bg-(--md-sys-color-surface-variant) animate-pulse rounded-full"></div>
            );
        }

        if (session) {
            return (
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button 
                            className="flex items-center gap-2 px-3 py-2 bg-(--md-sys-color-surface-container-highest) hover:bg-(--md-sys-color-surface-container-high) rounded-full transition-colors group relative"
                            title="Tài khoản"
                        >
                            <div className="w-8 h-8 rounded-full bg-(--md-sys-color-primary-container) flex items-center justify-center">
                                <span className="mdi text-sm text-(--md-sys-color-on-primary-container)">
                                    person
                                </span>
                            </div>
                            
                            {/* Session health indicator - Temporarily disabled */}
                            {/* {sessionHealth.status === 'warning' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-(--md-sys-color-tertiary) rounded-full">
                                    <span className="mdi text-xs text-(--md-sys-color-on-tertiary)">
                                        warning
                                    </span>
                                </div>
                            )}
                            {sessionHealth.status === 'error' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-(--md-sys-color-error) rounded-full">
                                    <span className="mdi text-xs text-(--md-sys-color-on-error)">
                                        error
                                    </span>
                                </div>
                            )} */}
                            
                            <span className="mdi text-sm text-(--md-sys-color-on-surface-variant) group-hover:text-(--md-sys-color-on-surface) transition-colors ml-1">
                                expand_more
                            </span>
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content 
                            className="min-w-56 bg-(--md-sys-color-surface-container) rounded-xl border border-(--md-sys-color-outline-variant) shadow-lg p-2 z-50"
                            sideOffset={8}
                            align="end"
                        >
                            {/* User Info Header */}
                            <div className="px-3 py-2 border-b border-(--md-sys-color-outline-variant) mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-(--md-sys-color-primary-container) flex items-center justify-center">
                                        <span className="mdi text-lg text-(--md-sys-color-on-primary-container)">
                                            person
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-(--md-sys-color-on-surface) truncate">
                                            {session.user?.given_name || session.user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-(--md-sys-color-on-surface-variant) truncate">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <DropdownMenu.Item asChild>
                                <Link 
                                    href="/orders"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) rounded-lg transition-colors cursor-pointer"
                                >
                                    <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">
                                        notifications
                                    </span>
                                    Thông báo
                                </Link>
                            </DropdownMenu.Item>

                            <DropdownMenu.Item asChild>
                                <Link 
                                    href="/orders"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) rounded-lg transition-colors cursor-pointer"
                                >
                                    <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">
                                        shopping_bag
                                    </span>
                                    Đơn hàng của tôi
                                </Link>
                            </DropdownMenu.Item>

                            <DropdownMenu.Item asChild>
                                <Link 
                                    href="/cart"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="relative">
                                        <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">
                                            shopping_cart
                                        </span>
                                        {getCartItemCount() > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-(--md-sys-color-error) text-(--md-sys-color-on-error) text-xs font-medium rounded-full flex items-center justify-center px-1">
                                                {getCartItemCount()}
                                            </span>
                                        )}
                                    </div>
                                    Giỏ hàng{getCartItemCount() > 0 && ` (${getCartItemCount()})`}
                                </Link>
                            </DropdownMenu.Item>

                            <DropdownMenu.Item asChild>
                                <Link 
                                    href="/profile"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) rounded-lg transition-colors cursor-pointer"
                                >
                                    <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">
                                        settings
                                    </span>
                                    Cài đặt tài khoản
                                </Link>
                            </DropdownMenu.Item>

                            {/* Admin Link (if admin) */}
                            {session && isAdmin(session) && (
                                <DropdownMenu.Item asChild>
                                    <Link 
                                        href="/admin"
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-primary) hover:bg-(--md-state-layers-primary-opacity-008) rounded-lg transition-colors cursor-pointer"
                                    >
                                        <span className="mdi text-lg text-(--md-sys-color-primary)">
                                            admin_panel_settings
                                        </span>
                                        Quản trị
                                    </Link>
                                </DropdownMenu.Item>
                            )}

                            <DropdownMenu.Separator className="h-px bg-(--md-sys-color-outline-variant) my-2" />

                            {/* Sign Out */}
                            <DropdownMenu.Item asChild>
                                <button 
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-(--md-sys-color-error) hover:bg-(--md-state-layers-error-opacity-008) rounded-lg transition-colors cursor-pointer w-full text-left"
                                >
                                    <span className="mdi text-lg text-(--md-sys-color-error)">
                                        logout
                                    </span>
                                    Đăng xuất
                                </button>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            );
        }

        return (
            <Button 
                variant="filled" 
                label="Đăng nhập"
                onClick={() => router.push('/login')}
                hasIcon
                icon="login"
            />
        );
    };

    return (
        /* Hide entire navbar on mobile, show only on desktop */
        <header className="hidden md:block bg-(--md-sys-color-surface) border-b border-(--md-sys-color-outline-variant) sticky top-0 z-50">
            <div className="container mx-auto lg:px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left section: Logo and Navigation */}
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <Image 
                                alt="VDT Store Logo" 
                                className="w-10 h-10" 
                                src="/logo.jpg" 
                                width={40} 
                                height={40} 
                            />
                        </Link>
                        
                        {/* Desktop Navigation */}
                        <NavigationMenu.Root className="flex">
                            <NavigationMenu.List className="flex items-center gap-1">
                                <NavigationMenu.Item>
                                    <NavigationMenu.Link asChild>
                                        <Link 
                                            href="/" 
                                            className="px-4 py-2 rounded-full text-sm font-medium text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) transition-colors"
                                        >
                                            Trang chủ
                                        </Link>
                                    </NavigationMenu.Link>
                                </NavigationMenu.Item>
                                
                                <NavigationMenu.Item>
                                    <NavigationMenu.Link asChild>
                                        <Link 
                                            href="/products" 
                                            className="px-4 py-2 rounded-full text-sm font-medium text-(--md-sys-color-on-surface) hover:bg-(--md-state-layers-on-surface-opacity-008) transition-colors"
                                        >
                                            Sản phẩm
                                        </Link>
                                    </NavigationMenu.Link>
                                </NavigationMenu.Item>
                            </NavigationMenu.List>
                            <NavigationMenu.Viewport />
                        </NavigationMenu.Root>
                    </div>
                    
                    {/* Center section: Search */}
                    <div className="flex-1 max-w-md mx-6">
                        <SearchBox className="w-full" />
                    </div>

                    {/* Right section: User actions */}
                    <div className="flex items-center gap-2">
                        {/* Notification icon */}
                        <IconButton
                            icon="notifications"
                            className="hidden lg:flex"
                            variant="standard"
                            size="medium"
                            aria-label="Thông báo"
                            title="Thông báo"
                            badge={false}
                        />
                        
                        {/* Cart icon */}
                        <IconButton
                            icon="shopping_cart"
                            className="hidden lg:flex"
                            variant="standard"
                            size="medium"
                            aria-label="Giỏ hàng"
                            title="Giỏ hàng"
                            badge={getCartItemCount() > 0}
                            badgeContent={getCartItemCount().toString()}
                            onClick={() => router.push('/cart')}
                        />
                        
                        {/* User account */}
                        {renderAuthSection()}
                    </div>
                </div>
            </div>
        </header>
    );
}
