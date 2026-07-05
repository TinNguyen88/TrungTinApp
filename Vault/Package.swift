// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Vault",
    platforms: [
        .iOS(.v17),
        .macOS(.v14) // Included for headless unit testing of cryptographic core
    ],
    products: [
        .library(
            name: "VaultCore",
            targets: ["VaultCore"]
        ),
    ],
    dependencies: [
        // No third-party dependencies! Apple Native CryptoKit & Security only.
    ],
    targets: [
        .target(
            name: "VaultCore",
            dependencies: [],
            path: "Vault/Core"
        ),
        .testTarget(
            name: "VaultTests",
            dependencies: ["VaultCore"],
            path: "Vault/Tests"
        ),
    ]
)
