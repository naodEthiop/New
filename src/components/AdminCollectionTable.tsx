import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';

interface AdminCollectionTableProps {
  collectionName: string;
}

const PAGE_SIZE = 20;

const AdminCollectionTable: React.FC<AdminCollectionTableProps> = ({ collectionName }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setLastDoc(null);
    fetchDocs();
    // eslint-disable-next-line
  }, [collectionName]);

  const fetchDocs = async (nextPage = false) => {
    setLoading(true);
    try {
      let q = query(collection(db, collectionName), orderBy('__name__'), limit(PAGE_SIZE));
      if (nextPage && lastDoc) {
        q = query(collection(db, collectionName), orderBy('__name__'), startAfter(lastDoc), limit(PAGE_SIZE));
      }
      const snap = await getDocs(q);
      const newDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocs(nextPage ? [...docs, ...newDocs] : newDocs);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (error) {
      setDocs([]);
    }
    setLoading(false);
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
      fetchDocs(true);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      // For simplicity, reload from start
      fetchDocs();
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!docs.length) return <div className="text-white/60">No data found in <b>{collectionName}</b>.</div>;

  // Get all unique keys for table columns
  const allKeys = Array.from(
    docs.reduce((keys, doc) => {
      Object.keys(doc).forEach(k => keys.add(k));
      return keys;
    }, new Set<string>())
  ) as string[];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead>
            <tr>
              {allKeys.map((key: string) => (
                <th key={key} className="px-4 py-2 border-b border-white/20 text-left font-bold bg-white/10">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => (
              <tr key={doc.id || i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                {allKeys.map((key: string) => (
                  <td key={key} className="px-4 py-2">
                    {typeof (doc as Record<string, any>)[key] === 'object' && (doc as Record<string, any>)[key] !== null
                      ? JSON.stringify((doc as Record<string, any>)[key])
                      : String((doc as Record<string, any>)[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-white/10 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white/80">Page {page}</span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className="px-4 py-2 bg-white/10 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminCollectionTable; 