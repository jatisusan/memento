import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useDeletePost, useGetPostById, useGetUserPosts } from "@/lib/react-query/queriesAndMutations";
import { timeAgo } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const PostDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: post, isPending } = useGetPostById(id || "");

	const { user } = useUserContext();

	const { mutateAsync: deletePost } = useDeletePost();

	const handleDeletePost = async () => {
		try {
			await deletePost({ postId: id || '', imageId: post?.imageId });
			toast.success("Post deleted successfully.", {unstyled: true, classNames: {toast: "bg-dark-3 p-6 flex-between rounded-xl", description: "text-light-2"}});
			navigate(-1);
		  } catch (error) {
			toast.error("Failed to delete post. Please try again.", {unstyled: true, classNames: {toast: "bg-dark-3 p-6 flex-between rounded-xl", description: "text-light-2"}});
		  }
	}

	const { data: userPosts, isPending: isUserPostsLoading } = useGetUserPosts(post?.creator.$id || "");
	const relatedPosts = userPosts?.documents.filter((post) => post.$id !== id);


	return (
		<div className="post_details-container">
			{isPending ? (
				<Loader />
			) : (
				<div className="post_details-card">
					<img src={post?.imageUrl} alt="post" className="post_details-img" />

					<div className="post_details-info">
						<div className="flex-between w-full">
							<Link
								to={`/profile/${post?.creator.$id}`}
								className="flex items-center gap-3"
							>
								<img
									src={
										post?.creator?.imageUrl ||
										"/assets/icons/profile-placeholder.svg"
									}
									alt="creator"
									className="rounded-full w-12 lg:h-12"
								/>

								<div className="flex flex-col items-start">
									<p className="base-medium lg:body-bold text-light-1">
										{post?.creator.name}
									</p>
									<div className="flex-center gap-2 text-light-3">
										<p className="subtle-semibold lg:small-regular ">
											{timeAgo(post?.$createdAt || "")}
										</p>
										•
										<p className="subtle-semibold lg:small-regular">
											{post?.location}
										</p>
									</div>
								</div>
							</Link>

							<div className="flex-center gap-2 md:gap-4">
								<Link
									to={`/update-post/${post?.$id}`}
									className={`${user.id !== post?.creator.$id && "hidden"}`}
								>
									<img
										src="/assets/icons/edit.svg"
										alt="edit"
										width={22}
										height={22}
									/>
								</Link>

								<Button variant={"ghost"} className={` ${user.id !== post?.creator.$id && "hidden"}`} onClick={() => handleDeletePost()}>
									<img
										src="/assets/icons/delete.svg"
										alt="delete"
										width={22}
										height={22}
									/>
								</Button>
							</div>
						</div>

						<hr className="border border-dark-4/80 w-full" />

						<div className="small-medium lg:base-regular flex flex-col flex-1">
							<p>{post?.caption}</p>
							<ul className="flex gap-1 mt-2">
								{post?.tags.map((tag: string, index: string) => (
									<li
										key={`${tag}${index}`}
										className="text-light-3 small-regular"
									>
										#{tag}
									</li>
								))}
							</ul>
						</div>

						<div className="w-full">
							<PostStats post={post} userId={user.id} />
						</div>
					</div>
				</div>
			)}

			<hr className="border border-dark-4/80 w-full" />

			<h3 className="body-bold md:h3-bold w-full my-6">Related Posts</h3>

			{
				isUserPostsLoading || !relatedPosts ? (
					<Loader />
				) : (
						<GridPostList posts={relatedPosts} /> 
				)
			}
		</div>
	);
};

export default PostDetails;
