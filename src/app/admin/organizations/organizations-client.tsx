"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminOrganization = {
  id: string;
  name: string;
  email: string;
  activeInductions: boolean;
  teamSize: number;
  lastInducted: string;
  slug: string;
};

export default function OrganizationsClient({ organizations }: { organizations: AdminOrganization[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Client-side filtering and searching
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredOrganizations.length);
  const paginatedOrganizations = filteredOrganizations.slice(startIndex, startIndex + entriesPerPage);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  const handleEntriesPerPageChange = (value: string) => {
    setCurrentPage(1);
    setEntriesPerPage(Number(value));
  };

  const handleRowClick = (slug: string) => {
    router.push(`/admin/organizations/about/${slug}`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-dark">Show</span>
          <Select value={entriesPerPage.toString()} onValueChange={handleEntriesPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-neutral-dark">entries</span>
        </div>

        <div className="flex-1 w-full sm:max-w-md sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-primary" />
            <Input
              placeholder="Search by Name or Email"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-dark/15 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-light/50 dark:bg-gray-dark border-b border-border text-neutral-primary uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Organization Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Active Inductions</th>
                <th className="px-4 py-3 font-medium">Team Size</th>
                <th className="px-4 py-3 font-medium">Last Inducted</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrganizations.length > 0 ? (
                paginatedOrganizations.map((org) => (
                  <tr 
                    key={org.id} 
                    onClick={() => handleRowClick(org.slug)}
                    className="border-b border-border hover:bg-neutral-light/30 dark:hover:bg-gray-dark/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4 font-medium text-primary dark:text-primary-bright group-hover:underline">
                      {org.name}
                    </td>
                    <td className="px-4 py-4">{org.email}</td>
                    <td className="px-4 py-4">
                      {org.activeInductions ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{org.teamSize}</td>
                    <td className="px-4 py-4">{org.lastInducted}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-primary">
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrganizations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-neutral-primary text-center sm:text-left">
            Showing {startIndex + 1} to {endIndex} of {filteredOrganizations.length} entries
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
