import { useState, useEffect } from 'react';
import testService from '../api/testService';

export const useProgression = (contratId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (contratId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [prog, rec] = await Promise.all([
            testService.getProgression(contratId),
            testService.getRecommendations(contratId)
          ]);
          setData(prog);
          setRecommendations(rec);
        } catch (error) {
          console.error("Error fetching progression", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [contratId]);

  return { data, loading, recommendations };
};
