import { useParams } from "react-router-dom"
import PostForm from "../../components/forms/PostForm"
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";

const EditPost = () => {

  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || '');

  if (isPending) return (
    <div className="my-10 flex-center w-full h-full">
      <Loader />
    </div>
  )

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 w-full">
          <img src="/assets/icons/add-post.svg" alt="add" width={36} height={36} />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        <PostForm post={post} action="Update" />
      </div>
    </div>
  )
}

export default EditPost