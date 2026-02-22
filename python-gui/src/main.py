import tkinter as tk
from tkinter import filedialog, messagebox
import customtkinter as ctk
from PIL import Image, ImageTk
import os

# --- System Settings ---
ctk.set_appearance_mode("light")  # Light theme as requested in images
ctk.set_default_color_theme("blue")

class FlashUSDTSenderApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Flash USDT Sender")
        self.geometry("1024x600")
        self.resizable(False, False)
        self.configure(fg_color="#F3F4F6") # Light gray background

        # --- Header Section ---
        self.header_frame = ctk.CTkFrame(self, fg_color="white", corner_radius=15, border_width=1, border_color="#E5E7EB")
        self.header_frame.pack(fill="x", padx=20, pady=(20, 10))

        # Logo Placeholder (Customizing with CTkLabel or Canvas)
        # In a real app, load the image provided. Recreating with stylized text/shapes.
        self.logo_label = ctk.CTkLabel(self.header_frame, text="₮", font=("Arial", 60, "bold"), 
                                      text_color="white", fg_color="#10B981", width=100, height=100, corner_radius=50)
        self.logo_label.grid(row=0, column=0, rowspan=2, padx=20, pady=20)

        self.title_label = ctk.CTkLabel(self.header_frame, text="Flash USDT Sender", 
                                       font=("Segoe UI", 24, "bold"), text_color="#111827")
        self.title_label.grid(row=0, column=1, sticky="sw", pady=(20, 0))

        self.subtitle_label = ctk.CTkLabel(self.header_frame, text="Load a wallet to start sending USDT", 
                                          font=("Segoe UI", 14), text_color="#6B7280")
        self.subtitle_label.grid(row=1, column=1, sticky="nw", pady=(0, 20))

        self.wallet_input_frame = ctk.CTkFrame(self.header_frame, fg_color="transparent")
        self.wallet_input_frame.grid(row=2, column=1, sticky="ew", padx=(0, 20), pady=(0, 20))

        self.wallet_entry = ctk.CTkEntry(self.wallet_input_frame, placeholder_text="Wallet address or file path...", 
                                        width=250, height=35, border_color="#D1D5DB")
        self.wallet_entry.pack(side="left", fill="x", expand=True)

        self.action_btn_frame = ctk.CTkFrame(self.header_frame, fg_color="transparent")
        self.action_btn_frame.grid(row=0, column=2, rowspan=3, sticky="ne", padx=20, pady=20)

        self.buy_btn = ctk.CTkButton(self.action_btn_frame, text="Buy Wallet", command=self.buy_wallet, 
                                    fg_color="#E5E7EB", text_color="#374151", hover_color="#D1D5DB", width=120)
        self.buy_btn.pack(pady=(0, 10))

        self.open_btn = ctk.CTkButton(self.action_btn_frame, text="Open Wallet File", command=self.open_wallet_file, 
                                     fg_color="#E5E7EB", text_color="#374151", hover_color="#D1D5DB", width=120)
        self.open_btn.pack()

        # --- Transaction Section ---
        self.tx_frame = ctk.CTkFrame(self, fg_color="white", corner_radius=15, border_width=1, border_color="#E5E7EB")
        self.tx_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Recipient
        self.recipient_label = ctk.CTkLabel(self.tx_frame, text="Recipient USDT Address :", 
                                           font=("Segoe UI", 14, "bold"), text_color="#374151")
        self.recipient_label.pack(anchor="w", padx=20, pady=(20, 5))
        
        self.recipient_entry = ctk.CTkEntry(self.tx_frame, placeholder_text="Enter destination address...", 
                                           width=520, height=40, border_color="#D1D5DB")
        self.recipient_entry.pack(padx=20, pady=5)

        # Amount
        self.amount_label = ctk.CTkLabel(self.tx_frame, text="Amount :", 
                                        font=("Segoe UI", 14, "bold"), text_color="#374151")
        self.amount_label.pack(anchor="w", padx=20, pady=(10, 5))

        self.amount_entry = ctk.CTkEntry(self.tx_frame, placeholder_text="0.00", 
                                        width=150, height=40, border_color="#D1D5DB")
        self.amount_entry.pack(anchor="w", padx=20, pady=5)

        # Network
        self.network_label = ctk.CTkLabel(self.tx_frame, text="Network :", 
                                         font=("Segoe UI", 14, "bold"), text_color="#374151")
        self.network_label.pack(anchor="w", padx=20, pady=(15, 5))

        self.network_var = tk.StringVar(value="TRC20")
        self.network_btn_frame = ctk.CTkFrame(self.tx_frame, fg_color="transparent")
        self.network_btn_frame.pack(fill="x", padx=20, pady=5)

        networks = ["TRC20", "ERC20", "BEP20", "BEP2", "SOLANA", "POLYGON"]
        for i, net in enumerate(networks):
            rb = ctk.CTkRadioButton(self.network_btn_frame, text=net, variable=self.network_var, value=net,
                                   text_color="#374151", border_color="#9CA3AF", hover_color="#3B82F6")
            rb.grid(row=i//3, column=i%3, sticky="w", padx=10, pady=10)

        # Send Button
        self.send_btn = ctk.CTkButton(self.tx_frame, text="SEND", command=self.send_usdt, 
                                     fg_color="#10B981", hover_color="#059669", 
                                     font=("Segoe UI", 18, "bold"), height=50)
        self.send_btn.pack(fill="x", padx=40, pady=30)

    # --- Actions ---
    def buy_wallet(self):
        messagebox.showinfo("Redirect", "Redirecting to the official purchase gateway...")

    def open_wallet_file(self):
        file_path = filedialog.askopenfilename(
            title="Open Wallet File",
            filetypes=[("Wallet Files", "*.txt *.json *.key"), ("All Files", "*.*")]
        )
        if file_path:
            self.wallet_entry.delete(0, tk.END)
            self.wallet_entry.insert(0, os.path.basename(file_path))
            messagebox.showinfo("Success", f"Synchronized with: {os.path.basename(file_path)}")

    def send_usdt(self):
        recipient = self.recipient_entry.get()
        amount = self.amount_entry.get()
        network = self.network_var.get()

        if not recipient or not amount:
            messagebox.showwarning("Incomplete", "Please enter Recipient Address and Amount.")
            return

        try:
            float_amount = float(amount)
            if float_amount <= 0: raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Amount must be a positive number.")
            return

        confirm = messagebox.askyesno("Confirm", f"Broadcast {amount} USDT on {network}?\n\nDest: {recipient}")
        if confirm:
            self.send_btn.configure(state="disabled", text="BROADCASTING...")
            self.after(2000, lambda: self.finish_send(recipient, amount, network))

    def finish_send(self, recipient, amount, network):
        self.send_btn.configure(state="normal", text="SEND")
        messagebox.showinfo("Broadcast Sent", f"Transaction broadcasted to {network} nodes.\n\nHash: {os.urandom(16).hex()}")

if __name__ == "__main__":
    app = FlashUSDTSenderApp()
    app.mainloop()
