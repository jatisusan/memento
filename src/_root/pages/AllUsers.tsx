import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useGetAllUsers } from "@/lib/react-query/queriesAndMutations"

const AllUsers = () => {

  const { data: users, isPending: isUserLoading } = useGetAllUsers();

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        {
          isUserLoading && !users ? 
            <Loader /> :
            (
              <ul className="user-grid">
                {users?.documents.map((user) => (
                  <li key={user.$id} className="flex-1">
                    <UserCard user={user} />
                  </li>
                ))}
              </ul>
            )
        }
      </div>
    </div>
  )
}

export default AllUsers