import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Home = () => {
	const { ref, inView } = useInView();

	const { data: posts, hasNextPage, fetchNextPage } = useGetPosts();

	useEffect(() => {
		if (inView) fetchNextPage();
	}, [inView]);
	const noMorePosts = posts && !hasNextPage;

	return (
		<div className="flex flex-1">
			<div className="home-container">
				<div className="home-posts">
					<h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>

					{!posts ? (
						<Loader />
					) : (
						<div className="flex flex-1 flex-col gap-9 w-full">
							{posts?.pages.map((page, index) => (
								<div key={index} className="flex flex-1 flex-col gap-9 w-full">
									{page.documents.map((post: Models.Document) => (
										<PostCard key={post.$id} post={post} />
									))}
								</div>
							))}
						</div>
					)}

					{noMorePosts && (
						<p className="text-light-4 mt-5 text-center w-full">End of posts</p>
					)}
				</div>
				{hasNextPage && (
					<div ref={ref}>
						<Loader />
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
