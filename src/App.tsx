import { useEffect, useState, useCallback } from "react";
import {  onAuthStateChanged,  User,} from "firebase/auth";
import { auth, db } from "./utils/firebase";
import { doc, setDoc, deleteDoc, getDoc, getDocs, addDoc, collection, updateDoc } from "firebase/firestore";
import { auth_register, auth_login, auth_logout, auth_deregister } from "./utils/auth";


type Item = {
  id: string;
  name: string;
  remarks: string;
};

export default function App() {
  const [name, setName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [itemName, setItemName] = useState<string>("");
  const [itemList, setItemList] = useState<Item[]>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  

  /** ログイン状態監視
   * @returns ログインユーザー監視解錠用関数
   */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);
 

  /** 新規登録　ユーザー登録とＤＢ登録   */
  const register = async () => {
    if (!name) {
      alert("名前を入力してください");
      return;
    }
    const new_user: User | undefined = await auth_register(email, password);

    if (new_user !== undefined) {
      // ② Firestoreにユーザー情報保存
      await setDoc(doc(db, "users", new_user.uid), {
        name: name, // ←入力した名前
        email: new_user.email,
      });
    }
  };

  /** ログイン */ 
  const login = async ():Promise<void> => {
    const current_user = await auth_login(email,password);

    if (current_user){
      const docSnap = await getDoc(doc(db, "users", current_user.uid));
      if (docSnap.exists()) {
        setName(docSnap.data().name);
        console.log("ユーザー情報取得成功");
      } else {
        console.log("ユーザー情報取得失敗");
      }
    }
  };

  
  // ログアウト
  const logout = async ():Promise<void> => {
    auth_logout()
  };

  // 登録削除
  const deregister = async ():Promise<void> => {
    if (!user) return;
    try {
      // Firestoreのデータ削除
      await deleteDoc(doc(db, "users", user.uid));
      auth_deregister(user)
      alert("登録削除しました");
    } catch (error) {
      alert("登録削除できませんでした");
      console.error(error);
    }
  };

  /**買い物登録 */
  const register_item = async ():Promise<void> => {
    if (user){
      await addDoc(
        collection(db, "users", user.uid, "items"),
        {
          name: itemName,
          remarks: remarks,
        }
      );
    } else {
      alert("ログインユーザー情報が取得できません");
      return;
    }
    setItemName("");
    get_item_list();

  };

  /**買い物項目の編集 */
  const edit_item = async (ok: boolean):Promise<void> => {
    if (!ok) {
      setItemName("");
      setRemarks("");
      setEditId(null);
      return;
    }
    if (!user){
      alert("ログインユーザー情報が取得できません");
      return;
    }

    if (editId === null) {
    alert("編集対象が選択されていません");
    return;
    }

    await updateDoc(
      doc(db, "users", user.uid, "items", editId),
      {
        name: itemName,
        remarks,
      }
    );
    
    setItemName("");
    setRemarks("");
    setEditId(null);
    get_item_list();

  };

  /**登録されている買い物リスト取得 */
  const get_item_list = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }
    //ユーザー情報を取得
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "items")
    );
    //アイテムリスト取得
    const data: Item[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as {
        name: string;
        remarks: string;
      }),
    }));
    setItemList(data);
  }, [user]);

  /**
   * get_item_list関数が更新されるとget_item_listを実行
   */
  useEffect(() => {
    const load = async () => {
      await get_item_list();
    };
    load();
  }, [get_item_list]);

  /** 買い物リスト一覧から削除する
   * @param id 買い物項目のid
   */
  const delete_item = async (id:string) => {
    await deleteDoc(
      doc(db, "users", user!.uid, "items", id)
    );

    get_item_list();
  }
  /**
   * 買い物リスト一覧の編集
   * @param item 
   */
  const prepare_edit_item = (item: Item) => {
    setItemName(item.name);
    setRemarks(item.remarks);
    setEditId(item.id);
  };


// ---------htmlメイン-------------

  // 未ログイン画面
  if (!user) {
    return (
      <div className="container mt-4">
        <h1>買い物リスト</h1>
        <h2>ログイン / 新規登録</h2>
        <input
          className="col-sm-2"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br/>
        <input
          className="col-sm-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <input
          className="col-sm-2"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className="btn btn-primary m-1" onClick={register}>新規登録</button>
        <button className="btn btn-secondary m-2" onClick={login}>ログイン</button>
        <br />
        <img src={process.env.PUBLIC_URL + "/list.png"} alt="買い物リスト" />
      </div>
    );
  }

  // ログイン後
  return (
    <div className="container mt-4">
      <div>
        <p>
          ログイン：{name} 
          <button className="btn btn-danger btn-sm ms-3" onClick={deregister}>登録削除</button>
          <button className="btn btn-warning btn-sm" onClick={logout}>ログアウト</button>
        </p>
      </div>
      <h1>買い物リスト</h1>
      <div style={{ maxWidth: "400px" }}>
        <ul className="list-group">
          {itemList.map((item) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
            <span>{item.name} {item.remarks}</span>
            <div>
              <button className="btn btn-success btn-sm" onClick={() => prepare_edit_item(item)}>編集</button>
              <button className="btn btn-info btn-sm" onClick={() => delete_item(item.id)}>削除</button>
            </div>
          </li>
          ))}
        </ul>
      </div>
      <div>
        { 
          editId === null 
          ? <h2 className="mt-3">買い物リスト新規登録</h2>
          : <h2 className="mt-3">買い物リスト編集</h2>
        }
        <input
          className="col-sm-2 my-2 me-2 "
          placeholder="買う物"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <input
          className="col-sm-2"
          placeholder="数量や備考"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <br />
        { 
          editId === null
          ? <button className="btn btn-primary" onClick={register_item}>登録</button>
          : <div><button className="btn btn-lite" onClick={()=>edit_item(true)}>編集</button>
          <button className="btn btn-dark" onClick={()=>edit_item(false)}>キャンセル</button></div>
        }
      </div>
    </div>
  );
}