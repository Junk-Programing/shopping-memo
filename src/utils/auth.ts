import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  deleteUser
} from "firebase/auth";
import { auth } from "./firebase";


/** メールとユーザーの登録
 * @param email メールアドレス
 * @param password パスワード
 * @returns ログインしたユーザー情報
 */
export const auth_register = async (email:string, password:string) => {
  
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user
  } catch (error:any) {
      console.log(error.code);

    switch (error.code) {
      case "auth/email-already-in-use":
        alert("このメールはすでに使われています");
        break;

      case "auth/invalid-email":
        alert("メールアドレスが正しくありません");
        break;

      case "auth/weak-password":
        alert("パスワードは6文字以上にしてください");
        break;

      default:
        alert("登録に失敗しました");
    }
  }
}

/** ログイン 
 * @param email メールアドレス
 * @param password パスワード
*/ 
export const auth_login = async (email:string, password:string):Promise<User | null> => {
  try {
  const useCredential=await signInWithEmailAndPassword(auth, email, password);
  return useCredential.user;
  } catch (error: any) {
    console.log(error.code);

    if (error.code === "auth/invalid-credential") {
      alert("メールまたはパスワードが間違っています");
    } else {
      alert("ログインに失敗しました");
    }
    return null;
  }
};

 // ログアウト
export const auth_logout = async ():Promise<void> => {
  await signOut(auth);
};

/* 登録削除
*@param user ユーザー情報
*/
export const auth_deregister = async (user:User|null):Promise<void> => {
  if (!user) return;

  // Authenticationのユーザー削除
  await deleteUser(user);

};