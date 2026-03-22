import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

type EventPayment = {
  id: string;
  event: string;
  amount: number;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

type ItemOrder = {
  id: string;
  item: string;
  quantity: number;
  total: number;
  date: string;
  status: "Paid" | "Processing" | "Delivered";
};

export default function StudentPayments() {
  const [selected, setSelected] = useState<any>(null);

  // Dummy Data (Replace with API later)
  const eventPayments: EventPayment[] = [
    { id: "P001", event: "Football Tournament", amount: 1500, date: "2026-03-10", status: "Approved" },
    { id: "P002", event: "Basketball League", amount: 1200, date: "2026-03-12", status: "Pending" },
  ];

  const itemOrders: ItemOrder[] = [
    { id: "O001", item: "Sports Shoes", quantity: 1, total: 5000, date: "2026-03-15", status: "Delivered" },
    { id: "O002", item: "Jersey", quantity: 2, total: 3000, date: "2026-03-16", status: "Processing" },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
      case "Delivered":
      case "Paid":
        return "default";
      case "Pending":
      case "Processing":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalPayments =
    eventPayments.reduce((sum, p) => sum + p.amount, 0) +
    itemOrders.reduce((sum, o) => sum + o.total, 0);

  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Payments"
          description="Track your sports item orders and event payments"
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className=" bg-indigo-100 hover:shadow-md" >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPayments} LKR</div>
            </CardContent>
          </Card>
          <Card className=" bg-indigo-100 hover:shadow-md" >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventPayments.filter(p => p.status === "Pending").length}
              </div>
            </CardContent>
          </Card>
          <Card className=" bg-indigo-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventPayments.filter(p => p.status === "Approved").length}
              </div>
            </CardContent>
          </Card>
          <Card className=" bg-indigo-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itemOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className=" p-1 rounded-lg flex gap-1 justify-start">

             <TabsTrigger
              value="items"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-indigo-950 data-[state=active]:text-white data-[state=active]:shadow-md">
              Sports Items
            </TabsTrigger>

            <TabsTrigger
              value="events"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-indigo-950 data-[state=active]:text-white data-[state=active]:shadow-md">
              Event Payments
            </TabsTrigger> 

            <TabsTrigger
              value="billing"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-indigo-950 data-[state=active]:text-white data-[state=active]:shadow-md">
             Billing Details
            </TabsTrigger>

          </TabsList>

          {/* Item Orders Table */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Sports Items Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-orange-100">
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.id}</TableCell>
                        <TableCell>{o.item}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell>{o.total} LKR</TableCell>
                        <TableCell>{o.date}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(o.status)}>{o.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelected(o)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p><strong>ID:</strong> {o.id}</p>
                                <p><strong>Item:</strong> {o.item}</p>
                                <p><strong>Quantity:</strong> {o.quantity}</p>
                                <p><strong>Total:</strong> {o.total} LKR</p>
                                <p><strong>Date:</strong> {o.date}</p>
                                <p><strong>Status:</strong> <Badge variant={getStatusVariant(o.status)}>{o.status}</Badge></p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Event Payments Table */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-orange-100">
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.event}</TableCell>
                        <TableCell>{p.amount} LKR</TableCell>
                        <TableCell>{p.date}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(p.status)}>{p.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p><strong>ID:</strong> {p.id}</p>
                                <p><strong>Event:</strong> {p.event}</p>
                                <p><strong>Amount:</strong> {p.amount} LKR</p>
                                <p><strong>Date:</strong> {p.date}</p>
                                <p><strong>Status:</strong> <Badge variant={getStatusVariant(p.status)}>{p.status}</Badge></p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
           <Card>
            <CardHeader>
               <CardTitle>Billing Details</CardTitle>
                   <p className="text-xs text-gray-600 mt-1">
                   Fill out or edit your billing information below.</p>
            </CardHeader>
            <CardContent>
             <form
              onSubmit={(e) => {
              e.preventDefault();
              alert("Billing details saved!");
              // Here you can call your API to save/update billing info
               }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             <div className="space-y-4">
              <div className="flex flex-col">
               <label className="text-sm font-medium text-gray-700">Full Name</label>
               <input
               type="text"
               disabled={!isEditing}
               placeholder="John Doe"
               className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
              </div>

             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
              type="email"
               disabled={!isEditing}
              placeholder="john@example.com"
              className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>

             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
              type="tel"
               disabled={!isEditing}
              placeholder="07x-xxxxxxx"
              className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>

             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Phone Number 2 (Optional)</label>
              <input
              type="tel"
               disabled={!isEditing}
              placeholder="07x-xxxxxxx"
              className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>
            </div>

            <div className="space-y-4">
             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
               type="text"
                disabled={!isEditing}
               placeholder="123 Main St"
               className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>

             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">City</label>
              <input
               type="text"
                disabled={!isEditing}
               placeholder="Colombo"
              className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>
             
             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Distric/Province</label>
              <input
               type="text"
                disabled={!isEditing}
               placeholder="Western Province"
               className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>

             <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Postal Code</label>
              <input
               type="text"
                disabled={!isEditing}
               placeholder="00100"
               className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"/>
             </div>

             </div>
             
            <div className="flex items-center gap-4 mt-6">
                <Button type="button" onClick={() => setIsEditing(true)} className="bg-orange-400 hover:bg-orange-500 text-white">
             Edit Billing Details
            </Button>

            <Button type="submit" className="bg-indigo-950 hover:bg-indigo-900 text-white">
             Save Billing Details
            </Button>

            </div>
             
         </form>
        </CardContent>
       </Card>
      </TabsContent>
     </Tabs>


         {/* Browse Products Section */}
  <div className="mt-8 ">
    <h2 className="text-xl font-semibold mb-4">Browse Products</h2>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

      {/* Example Product Card */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Cricket</h3>
         <Link to="/products/cricket" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

      {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Football</h3>
         <Link to="/products/football" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

      {/* Repeat Product Cards */}
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Volleyball</h3>
         <Link to="/products/volleyball" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

      {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Badminton</h3>
         <Link to="/products/badminton" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

      {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Rugby</h3>
         <Link to="/products/rugby" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

      {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Tennis</h3>
         <Link to="/products/tennis" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
    </div>

    {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Netball</h3>
         <Link to="/products/netball" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
     </div>

     {/* Repeat Product Cards */}
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition duration-300">
        <img
          src="/path/to/image.jpg"
          alt="Product"
          className="w-full h-40 object-cover rounded"/>

         {/* Text + Button in one row */}
        <div className="mt-2 flex items-center justify-between">
         <h3 className="font-medium text-gray-800">Carrom</h3>
         <Link to="/products/carrom" className="text-sm bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1 rounded-full">
          Shop Now
         </Link>
        </div>
     </div>
        
    </div>
  </div>
  </div>
    </DashboardLayout>
  );
}