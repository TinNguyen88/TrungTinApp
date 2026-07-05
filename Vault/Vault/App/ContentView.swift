//
//  ContentView.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    @State private var activeWorkspace: WorkspaceType = VaultSecurityEngine.shared.activeWorkspace
    @State private var pinInput: String = ""
    @State private var errorMessage: String? = nil
    
    let notificationPublisher = NotificationCenter.default.publisher(for: VaultSecurityEngine.workspaceDidChangeNotification)
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            switch activeWorkspace {
            case .none:
                lockScreenView
            case .real:
                realWorkspaceView
            case .fake:
                fakeWorkspaceView
            }
        }
        .onReceive(notificationPublisher) { _ in
            withAnimation(.easeInOut(duration: 0.2)) {
                self.activeWorkspace = VaultSecurityEngine.shared.activeWorkspace
            }
        }
    }
    
    // MARK: - Lock Screen View
    private var lockScreenView: View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 56))
                .foregroundColor(.emerald)
            
            Text("Vault")
                .font(.largeTitle.bold())
                .foregroundColor(.white)
            
            Text("Enter Master PIN or Duress PIN")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            // PIN Dots
            HStack(spacing: 16) {
                ForEach(0..<4, id: \.self) { index in
                    Circle()
                        .fill(pinInput.count > index ? Color.emerald : Color.gray.opacity(0.3))
                        .frame(width: 14, height: 14)
                }
            }
            .padding(.vertical, 12)
            
            if let err = errorMessage {
                Text(err)
                    .font(.footnote)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            Spacer()
            
            // Numeric Keypad
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 20) {
                ForEach(1...9, id: \.self) { num in
                    keypadButton("\(num)")
                }
                keypadButton("C")
                keypadButton("0")
                keypadButton("⌫")
            }
            .padding(.horizontal, 36)
            .padding(.bottom, 32)
        }
    }
    
    // MARK: - Real Workspace View
    private var realWorkspaceView: View {
        VStack(spacing: 20) {
            HStack {
                Text("My Organizer (Real)")
                    .font(.title2.bold())
                    .foregroundColor(.white)
                Spacer()
                Button("Lock") {
                    VaultSecurityEngine.shared.lockVault()
                }
                .foregroundColor(.red)
            }
            .padding()
            
            Spacer()
            Text("Sensitive Primary Workspace Mounted")
                .foregroundColor(.gray)
            Spacer()
            
            Button(action: {
                VaultSecurityEngine.shared.triggerEmergencyPanic(mountFakeWorkspace: true)
            }) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("SIMULATE 10s PANIC SWIPE")
                }
                .font(.headline)
                .foregroundColor(.black)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.amber)
                .cornerRadius(12)
            }
            .padding()
        }
    }
    
    // MARK: - Fake Workspace View
    private var fakeWorkspaceView: View {
        VStack(spacing: 20) {
            HStack {
                Text("My Organizer")
                    .font(.title2.bold())
                    .foregroundColor(.white)
                Spacer()
                Button("Lock") {
                    VaultSecurityEngine.shared.lockVault()
                }
                .foregroundColor(.gray)
            }
            .padding()
            
            Spacer()
            Text("Plausible Deniability Secondary Workspace")
                .foregroundColor(.gray)
            Spacer()
        }
    }
    
    // MARK: - Helpers
    private func keypadButton(_ title: String) -> View {
        Button(action: {
            handleKeypadPress(title)
        }) {
            Text(title)
                .font(.title2.bold())
                .foregroundColor(.white)
                .frame(width: 72, height: 72)
                .background(Color.gray.opacity(0.2))
                .clipShape(Circle())
        }
    }
    
    private func handleKeypadPress(_ title: String) {
        errorMessage = nil
        if title == "C" {
            pinInput = ""
        } else if title == "⌫" {
            if !pinInput.isEmpty { pinInput.removeLast() }
        } else {
            if pinInput.count < 4 {
                pinInput.append(title)
                if pinInput.count == 4 {
                    authenticatePin()
                }
            }
        }
    }
    
    private func authenticatePin() {
        do {
            _ = try VaultSecurityEngine.shared.authenticate(withPin: pinInput)
            pinInput = ""
        } catch {
            errorMessage = error.localizedDescription
            pinInput = ""
        }
    }
}

extension Color {
    static let emerald = Color(red: 0.06, green: 0.72, blue: 0.50)
    static let amber = Color(red: 0.96, green: 0.65, blue: 0.14)
}
