import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BillingDetails = {
	name: string;
	email: string;
	phone: string;
	phone2: string;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
};

type BillingErrors = Record<string, string>;

type CheckoutItem = {
	id: string;
	slug: string;
	name: string;
	price: number;
	image: string;
	sku: string;
	description: string;
};

const ITEM_CATALOG: CheckoutItem[] = [
	{
		id: "661111111111111111111111",
		slug: "cricket",
		name: "Cricket Jersey",
		price: 3200,
		image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200",
		sku: "UNI-CRK-001",
		description: "Official UniSports cricket jersey with breathable training fabric.",
	},
	{
		id: "662222222222222222222222",
		slug: "football",
		name: "Football Jersey",
		price: 3000,
		image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200",
		sku: "UNI-FTB-001",
		description: "Lightweight football jersey made for match-day comfort.",
	},
	{
		id: "663333333333333333333333",
		slug: "volleyball",
		name: "Volleyball Jersey",
		price: 2900,
		image: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200",
		sku: "UNI-VBL-001",
		description: "Stretch-fit volleyball jersey with moisture control panels.",
	},
	{
		id: "664444444444444444444444",
		slug: "badminton",
		name: "Badminton Tee",
		price: 2600,
		image: "https://images.unsplash.com/photo-1613918455609-4f9f8c6f7f27?w=1200",
		sku: "UNI-BDM-001",
		description: "Quick-dry badminton tee for training and tournaments.",
	},
	{
		id: "665555555555555555555555",
		slug: "rugby",
		name: "Rugby Jersey",
		price: 3500,
		image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200",
		sku: "UNI-RGB-001",
		description: "Durable rugby jersey with reinforced stitching.",
	},
	{
		id: "666666666666666666666666",
		slug: "tennis",
		name: "Tennis Polo",
		price: 2800,
		image: "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=1200",
		sku: "UNI-TNS-001",
		description: "Classic tennis polo with lightweight performance fabric.",
	},
	{
		id: "667777777777777777777777",
		slug: "netball",
		name: "Netball Kit",
		price: 2750,
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200",
		sku: "UNI-NTB-001",
		description: "Team-ready netball kit with breathable side mesh.",
	},
	{
		id: "668888888888888888888888",
		slug: "carrom",
		name: "Carrom Team Tee",
		price: 2200,
		image: "https://images.unsplash.com/photo-1512418490979-92798cec1380?w=1200",
		sku: "UNI-CRM-001",
		description: "Comfortable cotton blend team tee for indoor events.",
	},
];

const emptyBillingDetails: BillingDetails = {
	name: "",
	email: "",
	phone: "",
	phone2: "",
	address: {
		street: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Sri Lanka",
	},
};

export default function Checkout() {
	const navigate = useNavigate();
	const { itemSlug } = useParams<{ itemSlug: string }>();

	const [billingDetails, setBillingDetails] = useState<BillingDetails>(emptyBillingDetails);
	const [errors, setErrors] = useState<BillingErrors>({});
	const [transactionRef, setTransactionRef] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [receiptUrl, setReceiptUrl] = useState("");
	const [uploading, setUploading] = useState(false);
	const [placingOrder, setPlacingOrder] = useState(false);

	const getToken = () => localStorage.getItem("token") || "";

	const item = useMemo(
		() => ITEM_CATALOG.find((entry) => entry.slug === itemSlug),
		[itemSlug]
	);

	useEffect(() => {
		const loadBilling = async () => {
			try {
				const res = await fetch("http://localhost:5001/api/users/me/billing-details", {
					headers: { Authorization: `Bearer ${getToken()}` },
				});

				if (res.ok) {
					const data = await res.json();
					if (data?.data) {
						setBillingDetails({ ...emptyBillingDetails, ...data.data, address: { ...emptyBillingDetails.address, ...(data.data.address || {}) } });
						return;
					}
				}
			} catch (error) {
				// Fallback below
			}

			const cached = localStorage.getItem("billingDetails");
			if (cached) {
				const parsed = JSON.parse(cached);
				setBillingDetails({ ...emptyBillingDetails, ...parsed, address: { ...emptyBillingDetails.address, ...(parsed.address || {}) } });
			}
		};

		loadBilling();
	}, []);

	const handleBillingChange = (field: string, value: string) => {
		if (field.startsWith("address.")) {
			const key = field.split(".")[1] as keyof BillingDetails["address"];
			setBillingDetails((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
		} else {
			const key = field as keyof BillingDetails;
			setBillingDetails((prev) => ({ ...prev, [key]: value }));
		}

		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validate = () => {
		const next: BillingErrors = {};

		if (!billingDetails.name.trim()) next.name = "Full name is required";
		if (!billingDetails.email.trim()) next.email = "Email is required";
		else if (!billingDetails.email.endsWith("@my.sliit.lk")) next.email = "Use your student email";
		if (!/^\d{10}$/.test(billingDetails.phone)) next.phone = "Phone must be exactly 10 digits";
		if (!billingDetails.address.street.trim()) next["address.street"] = "Street address is required";
		if (!billingDetails.address.city.trim()) next["address.city"] = "City is required";
		if (!billingDetails.address.state.trim()) next["address.state"] = "District/Province is required";
		if (!billingDetails.address.zipCode.trim()) next["address.zipCode"] = "Postal code is required";
		if (!billingDetails.address.country.trim()) next["address.country"] = "Country is required";
		if (!transactionRef.trim()) next.transactionRef = "Transaction reference is required";
		if (!selectedFile && !receiptUrl) next.receipt = "Payment receipt is required";

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const uploadReceipt = async () => {
		if (!selectedFile) return receiptUrl;

		setUploading(true);
		try {
			const form = new FormData();
			form.append("receipt", selectedFile);

			const res = await fetch("http://localhost:5001/api/upload/receipt", {
				method: "POST",
				headers: { Authorization: `Bearer ${getToken()}` },
				body: form,
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.message || "Receipt upload failed");
			}

			const url = data?.data?.url;
			if (!url) throw new Error("Upload response did not return receipt URL");
			setReceiptUrl(url);
			toast.success("Receipt uploaded successfully");
			return url;
		} finally {
			setUploading(false);
		}
	};

	const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!item) return;
		if (!validate()) return;

		setPlacingOrder(true);
		try {
			const uploadedUrl = await uploadReceipt();
			const finalReceiptUrl = uploadedUrl || receiptUrl;
			if (!finalReceiptUrl) {
				throw new Error("Receipt upload is required");
			}

			const res = await fetch("http://localhost:5001/api/payments/manual", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getToken()}`,
				},
				body: JSON.stringify({
					type: "item",
					referenceId: item.id,
					amount: item.price,
					transactionRef,
					receiptUrl: finalReceiptUrl,
					billingDetails,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				if (Array.isArray(data?.errors)) {
					const mapped: BillingErrors = {};
					data.errors.forEach((err: { field?: string; message?: string }) => {
						const rawField = err.field || "";
						const normalizedField = rawField.startsWith("billingDetails.")
							? rawField.replace("billingDetails.", "")
							: rawField;
						if (normalizedField && err.message) {
							mapped[normalizedField] = err.message;
						}
					});

					if (Object.keys(mapped).length > 0) {
						setErrors((prev) => ({ ...prev, ...mapped }));
					}
				}
				throw new Error(data?.message || "Failed to place order");
			}

			localStorage.setItem("billingDetails", JSON.stringify(billingDetails));
			toast.success("Order placed successfully. Payment is pending verification.");
			navigate("/student/payments");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Order failed";
			toast.error(message);
		} finally {
			setPlacingOrder(false);
		}
	};

	if (!item) {
		return (
			<div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
				<Card className="border-red-200">
					<CardHeader>
						<CardTitle>Item Not Found</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-gray-600">The selected item is not available for checkout.</p>
						<Button asChild>
							<Link to="/student/payments">Back to Payments</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
					<p className="text-sm text-gray-500">Complete your billing details and upload your bank transfer receipt.</p>
				</div>
				<Button variant="outline" asChild>
					<Link to="/student/payments" className="inline-flex items-center gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Billing and Payment</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handlePlaceOrder} className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Full Name</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.name} onChange={(e) => handleBillingChange("name", e.target.value)} />
									{errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Email</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.email} onChange={(e) => handleBillingChange("email", e.target.value)} />
									{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Phone</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.phone} onChange={(e) => handleBillingChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
									{errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Phone 2 (Optional)</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.phone2} onChange={(e) => handleBillingChange("phone2", e.target.value.replace(/\D/g, "").slice(0, 10))} />
								</div>
								<div className="space-y-1 md:col-span-2">
									<label className="text-sm font-medium text-gray-700">Address</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.address.street} onChange={(e) => handleBillingChange("address.street", e.target.value)} />
									{errors["address.street"] && <p className="text-sm text-red-500">{errors["address.street"]}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">City</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.address.city} onChange={(e) => handleBillingChange("address.city", e.target.value)} />
									{errors["address.city"] && <p className="text-sm text-red-500">{errors["address.city"]}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">District/Province</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.address.state} onChange={(e) => handleBillingChange("address.state", e.target.value)} />
									{errors["address.state"] && <p className="text-sm text-red-500">{errors["address.state"]}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Postal Code</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.address.zipCode} onChange={(e) => handleBillingChange("address.zipCode", e.target.value)} />
									{errors["address.zipCode"] && <p className="text-sm text-red-500">{errors["address.zipCode"]}</p>}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Country</label>
									<input className="text-black w-full rounded-md border px-3 py-2" value={billingDetails.address.country} onChange={(e) => handleBillingChange("address.country", e.target.value)} />
									{errors["address.country"] && <p className="text-sm text-red-500">{errors["address.country"]}</p>}
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Bank Transaction Reference</label>
									<input
										className="text-black w-full rounded-md border px-3 py-2"
										value={transactionRef}
										onChange={(e) => {
											setTransactionRef(e.target.value);
											if (errors.transactionRef) setErrors((prev) => ({ ...prev, transactionRef: "" }));
										}}
										placeholder="e.g. TXN-482920"
									/>
									{errors.transactionRef && <p className="text-sm text-red-500">{errors.transactionRef}</p>}
								</div>

								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">Upload Receipt (JPG/PNG/PDF)</label>
									<input
										type="file"
										accept="image/png,image/jpeg,application/pdf"
										className="w-full rounded-md border px-3 py-2"
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											setSelectedFile(file);
											if (errors.receipt) setErrors((prev) => ({ ...prev, receipt: "" }));
										}}
									/>
									{selectedFile && <p className="text-xs text-gray-600">Selected: {selectedFile.name}</p>}
									{errors.receipt && <p className="text-sm text-red-500">{errors.receipt}</p>}
								</div>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<Button type="submit" disabled={placingOrder || uploading} className="sm:w-auto">
									{(placingOrder || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{placingOrder ? "Placing Order..." : uploading ? "Uploading Receipt..." : "Place Order"}
								</Button>
								<div className="inline-flex items-center gap-2 text-xs text-gray-500">
									<ShieldCheck className="h-4 w-4 text-green-600" />
									Your payment will be marked pending until admin verifies the receipt.
								</div>
							</div>
						</form>
					</CardContent>
				</Card>

				<Card className="h-fit lg:sticky lg:top-6">
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<img src={item.image} alt={item.name} className="h-44 w-full rounded-lg object-cover" />
						<div>
							<p className="text-lg font-semibold">{item.name}</p>
							<p className="text-xs uppercase tracking-wide text-gray-500">SKU: {item.sku}</p>
						</div>
						<p className="text-sm text-gray-600">{item.description}</p>

						<div className="rounded-lg border bg-gray-50 p-3">
							<div className="flex items-center justify-between text-sm">
								<span>Item Price</span>
								<span className="font-semibold">LKR {item.price.toLocaleString()}</span>
							</div>
							<div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
								<span>Total</span>
								<span className="text-lg font-bold text-indigo-900">LKR {item.price.toLocaleString()}</span>
							</div>
						</div>

						<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
							<div className="mb-1 inline-flex items-center gap-2 font-semibold">
								<FileUp className="h-4 w-4" />
								Manual Payment Notice
							</div>
							<p>Transfer the exact amount, upload your receipt, and place order. Inventory allocation is handled by admin.</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
