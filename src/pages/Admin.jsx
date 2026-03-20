import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { auth, db, storage } from "../firebase";
import { useSiteContent } from "../contexts/SiteContentContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LogOut, Save, RefreshCw } from "lucide-react";

export function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("hero");
  
  const { content, loading: contentLoading } = useSiteContent();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
      console.error(err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (contentLoading && user) {
    return <div className="p-8 text-muted-foreground animate-pulse">Loading CMS...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-paper p-8 rounded-md shadow-md w-full max-w-md border border-stone-200 space-y-6">
          <h1 className="text-3xl font-serif text-primary text-center">Admin Login</h1>
          {error && <p className="text-red-600 text-sm p-3 bg-red-50 rounded">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-2 bg-background border border-stone-300 rounded focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-2 bg-background border border-stone-300 rounded focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-foreground text-background py-2 px-4 rounded hover:bg-foreground/90 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-foreground font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-paper border-b md:border-b-0 md:border-r border-stone-200 p-6 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="mb-10">
          <h1 className="text-2xl font-serif text-primary">Crooked Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">CMS & Oversight Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('hero')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'hero' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            Hero Section
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'about' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            About Section
          </button>
          <button 
            onClick={() => setActiveTab('philosophy')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'philosophy' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            Philosophy Section
          </button>
          <div className="my-2 border-t border-stone-200"></div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'settings' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            Site Settings
          </button>
          <div className="my-2 border-t border-stone-200"></div>
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'inbox' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            Virtual Inbox
          </button>
          <button 
            onClick={() => setActiveTab('oversight')}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'oversight' ? 'bg-stone-200 font-medium' : 'hover:bg-stone-200/50'}`}
          >
            Chatbot Oversight
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-stone-200">
          <button onClick={handleLogout} className="flex items-center text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 hidden md:block">
            <h2 className="text-3xl font-serif text-primary capitalize">
              {activeTab === 'inbox' ? 'Virtual Inbox' : activeTab === 'oversight' ? 'Chatbot Oversight' : activeTab === 'settings' ? 'Site Settings' : `${activeTab} Editor`}
            </h2>
            <p className="text-muted-foreground mt-2">
              {activeTab === 'inbox' ? 'Review inquiries and AI summaries.' : activeTab === 'oversight' ? 'Review anonymous user conversations with Crooked AI.' : activeTab === 'settings' ? 'Manage global website configuration.' : 'Update the content shown on the public site real-time.'}
            </p>
          </header>

          {activeTab === 'inbox' ? (
            <VirtualInbox />
          ) : activeTab === 'oversight' ? (
            <ChatbotOversight />
          ) : (
            <CMSForm sectionName={activeTab} defaultValues={content[activeTab]} />
          )}
        </div>
      </div>
    </div>
  );
}

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Mail } from "lucide-react";

function VirtualInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-muted-foreground animate-pulse">Loading inbox...</div>;

  if (messages.length === 0) return (
    <div className="bg-paper p-12 text-center rounded-lg border border-stone-200 shadow-sm text-muted-foreground">
      Your inbox is currently empty.
    </div>
  );

  return (
    <div className="space-y-6">
      {messages.map(msg => (
        <div key={msg.id} className="bg-paper p-6 rounded-lg shadow-sm border border-stone-200 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium text-primary cursor-pointer">{msg.name}</h3>
              <p className="text-sm text-muted-foreground">{msg.email} &middot; {new Date(msg.createdAt).toLocaleDateString()}</p>
            </div>
            <a 
              href={`mailto:${msg.email}?subject=Re: Crooked Credenza Inquiry&body=Hi ${msg.name.split(' ')[0]},\n\nI received your message regarding your space...`}
              className="flex items-center text-sm bg-foreground text-background px-3 py-1.5 rounded hover:bg-foreground/90 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" /> Reply
            </a>
          </div>
          
          {msg.aiSummary && (
            <div className="bg-dust/50 p-4 rounded border-l-2 border-primary">
              <span className="text-xs uppercase tracking-widest font-semibold text-primary/70 mb-1 block">AI Summary</span>
              <p className="font-serif italic text-foreground/90">{msg.aiSummary}</p>
            </div>
          )}

          <div className="pt-2">
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CMSForm({ sectionName, defaultValues }) {
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues
  });
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    reset(defaultValues);
  }, [sectionName, defaultValues, reset]);

  const onSubmit = async (data) => {
    setSaveStatus("Saving...");
    try {
      const docRef = doc(db, "siteContent", sectionName);
      await setDoc(docRef, data, { merge: true });
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving document: ", error);
      setSaveStatus(`Error saving: ${error.message || "Unknown error"}`);
    }
  };

  const handleImageUpload = async (e, fieldKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setSaveStatus("Uploading image...");

    try {
      // Create a unique filename based on the section and time
      const storageRef = ref(storage, `siteContent/${sectionName}/${fieldKey}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update form value, marks it as dirty
      setValue(fieldKey, downloadURL, { shouldDirty: true });
      
      setSaveStatus("Image uploaded successfully! Remember to Publish Changes.");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error uploading image: ", error);
      setSaveStatus(`Error uploading image: ${error.message || "Unknown error"}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Determine field types based on strings
  const fields = Object.entries(defaultValues || {});

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-paper p-8 rounded-lg shadow-sm border border-stone-200 space-y-6">
      <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-6">
        <h3 className="text-xl font-medium capitalize">Edit {sectionName}</h3>
        <button 
          type="submit" 
          disabled={!isDirty || isSubmitting}
          className="bg-foreground text-background px-4 py-2 rounded flex items-center hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSubmitting ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {saveStatus && (
        <div className={`p-3 rounded text-sm ${saveStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {saveStatus}
        </div>
      )}

      <div className="space-y-6">
        {fields.map(([key, value]) => {
          // If value is long or has newlines, use textarea, else input
          const isTextArea = typeof value === 'string' && (value.length > 80 || value.includes('\n') || key.includes('paragraph') || key.includes('Text'));
          const isImage = key.toLowerCase().includes('image');
          const isBoolean = typeof value === 'boolean';

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {isBoolean ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register(key)}
                    className="w-5 h-5 accent-foreground cursor-pointer rounded border-stone-300 focus:ring-foreground"
                  />
                  <span className="text-sm text-muted-foreground">Enable this feature</span>
                </div>
              ) : isTextArea ? (
                <textarea 
                  {...register(key)} 
                  rows={4}
                  className="w-full p-3 bg-background border border-stone-300 rounded focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all resize-y"
                />
              ) : (
                <div className="relative">
                  {isImage && (
                    <div className="mb-2 space-y-3">
                      <div className="p-2 border border-stone-200 rounded block w-fit">
                        <img src={value} alt="Preview" className="h-20 w-auto object-cover rounded" />
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, key)}
                          disabled={uploadingImage}
                          className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/90 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}
                  <input 
                    type="text" 
                    {...register(key)} 
                    className="w-full p-3 bg-background border border-stone-300 rounded focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </form>
  );
}

import { MessageSquare } from "lucide-react";

function ChatbotOversight() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "conversations"), orderBy("lastUpdatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-muted-foreground animate-pulse">Loading conversations...</div>;

  if (conversations.length === 0) return (
    <div className="bg-paper p-12 text-center rounded-lg border border-stone-200 shadow-sm text-muted-foreground">
      No conversations tracked yet.
    </div>
  );

  return (
    <div className="space-y-6">
      {conversations.map(convo => (
        <div key={convo.id} className="bg-paper p-6 rounded-lg shadow-sm border border-stone-200 space-y-4">
          <div className="flex justify-between items-start mb-4 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" /> 
                Anonymous Thread ({convo.id.substring(0, 6)}...)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Last Updated: {new Date(convo.lastUpdatedAt).toLocaleString()}</p>
            </div>
          </div>
          
          {convo.aiSummary && (
            <div className="bg-dust/50 p-4 rounded border-l-2 border-primary mb-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-primary/70 mb-1 block">Genkit Summary</span>
              <p className="font-serif italic text-foreground/90">{convo.aiSummary}</p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {convo.messages.map((m, index) => {
              // Genkit message object format slightly differs from standard OpenAI format
              const text = m.content?.[0] ? Object.values(m.content[0])[0] : m.content;
              const isUser = m.role === "user";
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-md max-w-[80%] text-sm ${isUser ? 'bg-primary text-primary-foreground text-right' : 'bg-stone-100 text-foreground'}`}>
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
