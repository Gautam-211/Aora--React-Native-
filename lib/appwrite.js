import { Query } from 'appwrite';
import { Account, Avatars, Client, Databases,Storage, ID } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint : "https://cloud.appwrite.io/v1",
    platform : "com.gautam.aora",
    projectId : "671fb96500394e2175cc",
    databaseId : "671fc0570018b308068a",
    userCollectionId : "671fc090002c3c22509b",
    videoCollectionId : "671fc0d600289aa1fb59",
    storageId : "671fc2c7002f299240f3"
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async(email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if(!newAccount) {
            throw new Error("Account creation failed");
        }

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId : newAccount.$id,
                email,
                username,
                avatar : avatarUrl
            }
        );

        return newUser;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export async function signIn(email, password) {
    try { 
         // Create a new session
         const session = await account.createEmailPasswordSession(email, password);
         return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getCurrentUser = async() => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount){
            throw new Error("User not found");
        }

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount?.$id)]
        )


        if(!currentUser) {
            throw Error
        };

        return currentUser.documents[0]; 

    } catch (error) {
        console.log("Error", error);
        throw new Error(error);
    }
}

export const getAllPosts = async() => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt')]
        );

        return posts.documents;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
} 

export const getLatestPosts = async() => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit())]
        );

        return posts.documents;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
} 

export const searchPosts = async(query) => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.search('title', query)]
        );

        return posts.documents;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
} 

export const getUserPosts = async(userId) => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.equal('creator', userId), Query.orderDesc("$createdAt")]
        );

        return posts.documents;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
} 

export const signOut = async() => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getFilePreview = async(fileId, type) => {
    let  fileUrl;

    try {
        if(type === "video"){
            fileUrl =  storage.getFileView(appwriteConfig.storageId, fileId);
        }
        else if(type === "image"){
            fileUrl =  storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, 'top', 100);
        }   
        else{
            throw new Error("Invalid file type");
        }

        if(!fileUrl){
            throw new Error("File not found");
        }

        return fileUrl;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const uploadFile = async(file, type) => {
    if(!file){
        return;
    }

    const asset = {
        name : file.fileName,
        size : file.fileSize,
        uri : file.uri,
        type : file.mimeType
    };

    try {
        const uploadedFile = await storage.createFile(appwriteConfig.storageId, ID.unique(), asset);
        const fileUrl = await getFilePreview(uploadedFile.$id, type);

        return fileUrl;
        
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const createVideo = async(form) => {  
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail,"image"),
            uploadFile(form.video, "video")
        ])

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId, appwriteConfig.videoCollectionId, ID.unique(), {
                title : form.title,
                prompt : form.prompt,
                thumbnail : thumbnailUrl,
                video : videoUrl,
                creator : form.userId
            }
        )

        return newPost;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

