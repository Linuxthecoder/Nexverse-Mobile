import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(6).fill(null);

  return (
    <aside
      className="h-full w-20 lg:w-72 border-r border-base-300 
      flex flex-col bg-base-100 text-base-content transition-all duration-200"
      aria-busy="true"
      aria-label="Loading contacts"
    >
      {/* Header Skeleton */}
      <div className="border-b border-base-300 w-full p-5 flex items-center gap-2">
        <div className="animate-pulse">
          <Users className="w-6 h-6 text-primary opacity-70" />
        </div>
        <div className="hidden lg:block">
          <div className="skeleton h-6 w-24 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton Contacts List */}
      <div className="overflow-y-auto flex-1 p-3">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full flex items-center gap-3 p-2 lg:p-3 rounded-lg hover:bg-base-300/50 transition-colors duration-150"
          >
            {/* Avatar Skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-10 lg:size-12 rounded-full border-2 border-base-100"></div>
              {/* Optional: Online dot placeholder */}
              <div className="absolute bottom-0 right-0 skeleton size-3 rounded-full"></div>
            </div>

            {/* User Info Skeleton (Only on Large Screens) */}
            <div className="hidden lg:flex flex-col min-w-0 flex-1 space-y-2">
              <div className="skeleton h-5 w-36 rounded-md"></div>
              <div className="skeleton h-3 w-28 rounded-md opacity-70"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Placeholder (for visual balance) */}
      <div className="p-4 border-t border-base-300 bg-base-200/30">
        <div className="skeleton h-4 w-40 mx-auto lg:mx-0"></div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;