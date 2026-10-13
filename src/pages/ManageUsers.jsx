import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { readCollection } from "../lib/api";

const roles = ["citizen", "staff", "admin"];

const ManageUsers = () => {
  const { user } = UseAuth();
  const api = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const queryKey = ["manage-users"];

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get("/users", { params: { limit: 200 } });
      return readCollection(response.data);
    },
    enabled: user?.role === "admin",
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, action, value }) =>
      action === "role"
        ? api.patch(`/users/${id}/role`, { role: value })
        : api.patch(`/users/${id}/block`, { isBlocked: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) =>
      Swal.fire(
        "Update failed",
        error.response?.data?.message || "Could not update this user.",
        "error"
      ),
  });

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(
      (item) =>
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
    );
  }, [users, search]);

  if (user?.role !== "admin") {
    return <p className="py-12 text-center text-error">Administrator access is required.</p>;
  }

  if (isLoading) {
    return <div className="py-12 text-center" role="status">Loading users…</div>;
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-error">Could not load users from the service.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm mt-3">
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Review registered accounts and update roles or account access.
        </p>
        <input
          className="input input-bordered mt-4 w-full max-w-md"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => (
              <tr key={item._id || item.uid || item.email}>
                <td>{item.name || item.displayName || "Unnamed user"}</td>
                <td>{item.email || "No email"}</td>
                <td>
                  <select
                    className="select select-bordered select-sm"
                    value={item.role || "citizen"}
                    disabled={!item._id || updateMutation.isPending || item.email === user.email}
                    onChange={(event) =>
                      updateMutation.mutate({
                        id: item._id,
                        action: "role",
                        value: event.target.value,
                      })
                    }
                    aria-label={`Role for ${item.email}`}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn btn-sm ${item.isBlocked ? "btn-success" : "btn-warning"}`}
                    disabled={!item._id || updateMutation.isPending || item.email === user.email}
                    onClick={() =>
                      updateMutation.mutate({
                        id: item._id,
                        action: "block",
                        value: !item.isBlocked,
                      })
                    }
                  >
                    {item.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-base-content/60">
                  {users.length ? "No users match your search." : "No users are available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManageUsers;
