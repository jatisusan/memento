import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import {
	Link,
	Outlet,
	Route,
	Routes,
	useLocation,
	useParams,
} from "react-router-dom";
import LikedPosts from "./LikedPosts";

const Profile = () => {
	const { user } = useUserContext();

	const { id } = useParams();

	const { data: currentUser, isFetching } = useGetUserById(id || "");

	const { pathname } = useLocation();



	if (!currentUser || isFetching) {
		return (
			<div className="flex-center w-full h-full">
				<Loader />
			</div>
		);
	}

	return (
		<div className="profile-container">
			<div className="profile-inner_container">
				<div className="flex flex-1 gap-7 lg:gap-12 flex-col xl:flex-row max-xl:items-center">
					<img
						src={
							currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
						}
						alt="profile"
						className="w-28 h-28 lg:w-36 lg:h-36 rounded-full"
					/>

					<div className="flex flex-col flex-1 md:mt-2">
						<div className="flex-flex-col w-full">
							<h1 className="h3-bold md:h1-semibold w-full text-center xl:text-left">
								{currentUser.name}
							</h1>
							<p className="small-regular md:body-medium text-center xl:text-left text-light-3">
								@{currentUser.username}
							</p>
						</div>

						<p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
							{currentUser.bio}
						</p>
					</div>

					<div>
						<Link
							to={`/update-profile/${currentUser.$id}`}
							className={`h-12 px-5 bg-dark-4 text-light-1 rounded-lg flex-center gap-2 ${
								currentUser.$id !== user.id && "hidden"
							}`}
						>
							<img
								src="/assets/icons/edit.svg"
								width={20}
								height={20}
								alt="edit"
							/>
							<p>Edit profile</p>
						</Link>
					</div>
				</div>
			</div>

			{currentUser.$id === user.id && (
				<div className="flex w-full max-w-5xl">
					<Link
						to={`/profile/${id}`}
						className={`profile-tab rounded-l-lg ${
							pathname === `/profile/${id}` && "!bg-dark-4"
						}`}
					>
						<img
							src="/assets/icons/posts.svg"
							width={20}
							height={20}
							alt="posts"
						/>
						Posts
					</Link>

					<Link
						to={`/profile/${id}/liked-posts`}
						className={`profile-tab rounded-r-lg ${
							pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
						}`}
					>
						<img
							src="/assets/icons/like.svg"
							width={20}
							height={20}
							alt="posts"
						/>
						Liked
					</Link>
				</div>
			)}

			<Routes>
				<Route
					index
					element={<GridPostList posts={currentUser.posts} showUser={false} />}
				/>

				<Route path="/liked-posts" element={<LikedPosts />} />
			</Routes>
			<Outlet />
		</div>
	);
};

export default Profile;
