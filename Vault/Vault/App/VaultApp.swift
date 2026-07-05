//
//  VaultApp.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import SwiftUI

@main
struct VaultApp: App {
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onReceive(NotificationCenter.default.publisher(for: VaultSecurityEngine.workspaceDidChangeNotification)) { _ in
                    // UI automatically re-evaluates mounted workspace root
                }
        }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .background {
                // Enforce lifecycle hygiene: instantly scrub Real keys from RAM when entering background
                VaultSecurityEngine.shared.triggerEmergencyPanic(mountFakeWorkspace: true)
            }
        }
    }
}
