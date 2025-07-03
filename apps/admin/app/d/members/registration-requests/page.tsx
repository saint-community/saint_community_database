"use client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Bell,
  Settings,
  Filter,
  Badge,
  Clock,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const RegistrationRequests = () => {
  const pendingMembers = [
    {
      id: 1,
      name: "John Smith",
      status: "Member",
      statusColor: "bg-blue-100 text-blue-800",
      submittedDate: "June 12, 2024 at 11:30AM",
      email: "johnsmith@example.com",
      phone: "(+234) 8129968537",
      homeAddress: "Home - 123 Main Street,Orile, Lagos State, Nigeria",
      workAddress: "Work - 123 Main Street,Orile, Lagos State, Nigeria",
      birthDate: "21 July, 1994",
      church: "Egbeda",
      pastor: "Pastor's Name",
      fellowship: "Egbeda",
      fellowshipLeader: "John Doe",
      cell: "Okunlakoro Cell",
      cellLeader: "John Smith",
      department: "Operations",
    },
    {
      id: 2,
      name: "John Smith",
      status: "Visitor",
      statusColor: "bg-green-100 text-green-800",
      submittedDate: "June 12, 2024 at 11:30AM",
      email: "johnsmith@example.com",
      phone: "(+234) 8129968537",
      homeAddress: "Home - 123 Main Street,Orile, Lagos State, Nigeria",
      workAddress: "Work - 123 Main Street,Orile, Lagos State, Nigeria",
      birthDate: "21 July, 1994",
      church: "Egbeda",
      pastor: "Pastor's Name",
      fellowship: "Egbeda",
      fellowshipLeader: "John Doe",
      cell: "Okunlakoro Cell",
      cellLeader: "John Smith",
      department: "Operations",
    },
    {
      id: 3,
      name: "John Smith",
      status: "Friend",
      statusColor: "bg-purple-100 text-purple-800",
      submittedDate: "June 12, 2024 at 11:30AM",
      email: "johnsmith@example.com",
      phone: "(+234) 8129968537",
      homeAddress: "Home - 123 Main Street,Orile, Lagos State, Nigeria",
      workAddress: "Work - 123 Main Street,Orile, Lagos State, Nigeria",
      birthDate: "21 July, 1994",
      church: "Egbeda",
      pastor: "Pastor's Name",
      fellowship: "Egbeda",
      fellowshipLeader: "John Doe",
      cell: "Okunlakoro Cell",
      cellLeader: "John Smith",
      department: "Operations",
    },
    {
      id: 4,
      name: "John Smith",
      status: "Committed Friend",
      statusColor: "bg-indigo-100 text-indigo-800",
      submittedDate: "June 12, 2024 at 11:30AM",
      email: "johnsmith@example.com",
      phone: "(+234) 8129968537",
      homeAddress: "Home - 123 Main Street,Orile, Lagos State, Nigeria",
      workAddress: "Work - 123 Main Street,Orile, Lagos State, Nigeria",
      birthDate: "21 July, 1994",
      church: "Egbeda",
      pastor: "Pastor's Name",
      fellowship: "Egbeda",
      fellowshipLeader: "John Doe",
      cell: "Okunlakoro Cell",
      cellLeader: "John Smith",
      department: "Operations",
    },
    {
      id: 5,
      name: "John Smith",
      status: "Worker in Training",
      statusColor: "bg-orange-100 text-orange-800",
      submittedDate: "June 12, 2024 at 11:30AM",
      email: "johnsmith@example.com",
      phone: "(+234) 8129968537",
      homeAddress: "Home - 123 Main Street,Orile, Lagos State, Nigeria",
      workAddress: "Work - 123 Main Street,Orile, Lagos State, Nigeria",
      birthDate: "21 July, 1994",
      church: "Egbeda",
      pastor: "Pastor's Name",
      fellowship: "Egbeda",
      fellowshipLeader: "John Doe",
      cell: "Okunlakoro Cell",
      cellLeader: "John Smith",
      department: "Operations",
    },
  ];
  return (
    <div className="flex-1 flex flex-col">
     

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="bg-gray-100 text-gray-700">
              Pending
            </Button>
            <Button variant="ghost" className="bg-black text-white">
              Approved
            </Button>
            <Button variant="ghost" className="text-gray-600">
              Rejected
            </Button>
            <Button variant="outline" size="sm" className="ml-4 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Pending List</h1>

        {/* Member Cards */}
        <div className="space-y-4">
          {pendingMembers.map((member) => (
            <Card key={member.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <Badge className={`text-xs ${member.statusColor}`}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted {member.submittedDate}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{member.homeAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{member.workAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📅</span>
                    <span>{member.birthDate}</span>
                  </div>
                </div>

                {/* Other Details */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Other Details:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">
                        CHURCH: {member.church}
                      </div>
                      <div className="text-gray-600">
                        Pastor: {member.pastor}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">
                        Fellowship: {member.fellowship}
                      </div>
                      <div className="text-gray-600">
                        Fellowship/PCF Leader: {member.fellowshipLeader}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Cell: {member.cell}</div>
                      <div className="text-gray-600">
                        Cell Leader: {member.cellLeader}
                      </div>
                      <div className="text-gray-600">
                        Department: {member.department}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-gray-600 bg-transparent"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="text-yellow-600 border-yellow-300 bg-transparent"
                  >
                    Leave Pending
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="ghost" size="sm" className="text-gray-400">
            {"<"}
          </Button>
          <Button variant="ghost" size="sm" className="bg-blue-500 text-white">
            1
          </Button>
          <Button variant="ghost" size="sm">
            2
          </Button>
          <Button variant="ghost" size="sm">
            3
          </Button>
          <Button variant="ghost" size="sm">
            4
          </Button>
          <Button variant="ghost" size="sm">
            5
          </Button>
          <span className="text-gray-400">...</span>
          <Button variant="ghost" size="sm">
            10
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationRequests;
