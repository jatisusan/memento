import { ID, Query } from "appwrite";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "../../types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if(!newAccount) {
            throw new Error("Failed to create user account");
        }

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });

        return newUser;
    } catch (error) {
        console.error("Error creating user account:", error);
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    name: string;
    email: string;
    username?: string;
    imageUrl: string;
}) { 
    try {
        const newUser = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), user);

        return newUser;
    } catch (error) {
        console.error("Error saving user to database:", error); 
    }
}

export async function signInAccount(user: { email: string, password: string }) { 
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    } catch (error) {
        console.error("Error signing in user:", error);   
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.error("Error signing out user:", error);
    }
}


// ================ POSTS
export async function createPost(post: INewPost) {
    try {

        // upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw Error;

        // get image url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to get file preview URL");
        }

        // convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // create post in database
        const newPost = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, ID.unique(), {
            creator: post.userId,
            caption: post.caption,
            imageUrl: fileUrl,
            imageId: uploadedFile.$id,
            tags: tags,
            location: post.location
        });

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to create post");
        }

        return newPost;

    } catch (error) {
        console.error("Error creating post:", error);
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(appwriteConfig.storageId, ID.unique(), file);
        return uploadedFile;
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
        if (!fileUrl) throw new Error("Failed to get file preview URL");
        return fileUrl;
    } catch (error) {
        console.error("Error getting file preview:", error);
    }
}

export async function deleteFile(fileId: string) {
    try {
      await storage.deleteFile(appwriteConfig.storageId, fileId);
  
      return { status: "ok" };
    } catch (error) {
      console.log(error);
    }
}
  
export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(10)],
        );

        if (!posts) {
            throw new Error("No posts found");
        }
        return posts;
    } catch (error) {
        console.error("Error getting recent posts:", error);
        
    }
}

export async function likePost(postId:string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function savePost(postId:string, userId: string) {
    try {
        const newSave = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        );

        if (!newSave) throw Error;

        return newSave;
    } catch (error) {
        console.log(error);
    }
}

export async function unsavePost(savedPostId:string) {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedPostId
        )

        return {status: 'OK'};
    } catch (error) {
        console.log(error);
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );

        if (!post) throw Error;
        return post;
    } catch (error) {
        console.log(error); 
    }
}

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;

    try {
        let image = {
            imageId: post.imageId,
            imageUrl: post.imageUrl
        }

        if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;
      
            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
              await deleteFile(uploadedFile.$id);
              throw Error;
            }
      
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }
        
        // convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // create post in database
        const updatedPost = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, post.postId, {
            caption: post.caption,
            imageUrl: image.imageUrl,
            imageId: image.imageId,
            tags: tags,
            location: post.location
        });

        if (!updatedPost) {
            // Delete new file that has been recently uploaded
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            throw new Error("Failed to update post");
        }

        // Safely delete old file after successful update
        await deleteFile(post.imageId);

        return updatedPost;

        
    } catch (error) {
        console.log(error);
        
    }
}

export async function deletePost(postId: string, imageId: string) {
    try {
        const status = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );

        if (!status) throw Error;

        await deleteFile(imageId);

        return {status: "ok"};
    } catch (error) {
        console.log(error);
    }
}

export async function searchPost(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search("caption", searchTerm)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(3)];
  
    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }
  
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
}

export async function getUserPosts(userId: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );

        if (!posts) throw Error("No posts found");

        return posts;
    } catch (error) {
        console.log(error);
    }
}
  

// ================ USER
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) {
            throw new Error("No current user found");
        }
        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)],
        );

        if (!user) throw Error;

        return user.documents[0];
    } catch (error) {
        console.error("Error getting current user:", error);
    }
}

export async function getUserById(userId:string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if (!user) throw Error('User not found');

        return user;
    } catch (error) {
        console.log(error);
    }
}

export async function updateUser(user:IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;

    try {

        let image = {
            imageId: user.imageId,
            imageUrl: user.imageUrl
        }

        if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = {...image, imageId: uploadedFile.$id, imageUrl: fileUrl}
        }
        
         //  Update user
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                username: user.username,
                bio: user.bio,
                imageId: image.imageId,
                imageUrl: image.imageUrl
            }
        );

        // Failed to update
        if (!updatedUser) {
            // Delete new file that has been recently uploaded
            if(hasFileToUpdate) await deleteFile(image.imageId);
            throw Error;
        }

        // Safely delete old file after successful update
        if (user.imageId && hasFileToUpdate) await deleteFile(user.imageId);

        return updatedUser;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllUsers(limit?: number) {
    try {
        const queries = [Query.orderDesc("$createdAt")];

        if (limit) {
            queries.push(Query.limit(limit));
        }

        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            queries
        );

        if (!users) throw Error("No users found");
        return users;
    } catch (error) {
        console.log(error);
    }
}
