import {
	useGetCurrentUser,
	useLikePost,
	useSavePost,
	useUnsavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatsProps = {
	post?: Models.Document;
	userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
	const { data: currentUser } = useGetCurrentUser();

	const { mutate: likePost } = useLikePost();
	const { mutate: savePost, isPending: isSavingPost } = useSavePost();
	const { mutate: unsavePost, isPending: isUnsavingPost } = useUnsavePost();

	const likesList = post?.likes.map((user: Models.Document) => user.$id);

	const [likes, setLikes] = useState(likesList);
	const [isSaved, setIsSaved] = useState(false);

	const handleLikePost = (e: React.MouseEvent) => {
		e.stopPropagation();

		let newLikes = [...likes];

		const hasLiked = newLikes.includes(userId);

		if (hasLiked) {
			newLikes = newLikes.filter((id) => id !== userId);
		} else {
			newLikes.push(userId);
		}

		setLikes(newLikes);
		likePost({ postId: post?.$id || '', likesArray: newLikes });
	};

	const savedPostRecord = currentUser?.save.find(
		(record: Models.Document) => record.post.$id === post?.$id
	);

	useEffect(() => {
		setIsSaved(!!savedPostRecord);
	}, [currentUser]);

	const handleSavePost = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (savedPostRecord) {
			setIsSaved(false);
			unsavePost(savedPostRecord.$id);
		} else {
			savePost({ postId: post?.$id || '', userId });
			setIsSaved(true);
		}
	};

	return (
		<div className="flex-between">
			<div className="flex gap-2 mr-5">
				<img
					src={
						checkIsLiked(likes, userId)
							? "/assets/icons/liked.svg"
							: "/assets/icons/like.svg"
					}
					alt="like"
					width={20}
					height={20}
					onClick={handleLikePost}
					className="cursor-pointer"
				/>
				<p className="small-medium lg:base-medium">{likes.length}</p>
			</div>
			<div className="flex gap-2">
				{isSavingPost || isUnsavingPost ? (
					<Loader />
				) : (
					<img
						src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
						alt="save"
						width={20}
						height={20}
						onClick={handleSavePost}
						className="cursor-pointer"
					/>
				)}
			</div>
		</div>
	);
};

export default PostStats;
