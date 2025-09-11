import { useState, type KeyboardEvent, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminButton from '../../components/ui/AdminButton';
import { Icon } from '../../components/ui/Icon';
import Input from '../../components/ui/Input';
import { useDialogs } from '../../lib/dialogs';
import adminApi from '../../api/adminApi';
import type { KeywordsResponse, UpdateKeywordsPayload } from '../../api/types';

interface KeywordLabelProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const KeywordLabel = ({ children, onDelete }: KeywordLabelProps) => {
  return (
    <div className="inline-flex items-center gap-2 border-1 border-[#e9edf0] bg-[#f4f4f4] rounded-full px-2 h-[34px]">
      <span>{children}</span>
      <button
        onClick={onDelete}
        className="inline-flex justify-center items-center size-[18px] bg-[#8E9AA4] rounded-full"
      >
        <Icon.X className="stroke-white size-[10px]" />
      </button>
    </div>
  );
};

interface KeywordPair {
  ko: string;
  en: string;
}

const KeywordManagerModal = () => {
  const { closeDialog } = useDialogs();
  const queryClient = useQueryClient();

  // --- API 데이터 Fetching ---
  const {
    data: initialData,
    isPending,
    isError,
  } = useQuery<KeywordsResponse, Error>({
    queryKey: ['keywords'],
    queryFn: adminApi.getKeywords,
  });

  // --- 상태 관리 ---
  const [fixedKeywordInput, setFixedKeywordInput] = useState('');
  const [fixedKeywords, setFixedKeywords] = useState<string[]>([]);
  const [styleInput, setStyleInput] = useState({ ko: '', en: '' });
  const [styleKeywords, setStyleKeywords] = useState<KeywordPair[]>([]);
  const [moodInput, setMoodInput] = useState({ ko: '', en: '' });
  const [moodKeywords, setMoodKeywords] = useState<KeywordPair[]>([]);

  // --- API 데이터 로드 완료 시 상태 업데이트 ---
  useEffect(() => {
    if (initialData) {
      setFixedKeywords(initialData.fixedKeywords);
      setStyleKeywords(
        initialData.styleKeywords.map((k) => ({ ko: k.label, en: k.value }))
      );
      setMoodKeywords(
        initialData.moodKeywords.map((k) => ({ ko: k.label, en: k.value }))
      );
    }
  }, [initialData]);

  // --- API 데이터 업데이트 Mutation ---
  const { mutate: updateKeywords, isPending: isUpdating } = useMutation({
    mutationFn: adminApi.updateKeywords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      closeDialog();
    },
    onError: (error) => {
      console.error('키워드 저장 실패:', error);
      alert('키워드 저장에 실패했습니다.');
    },
  });

  const handleSave = () => {
    const payload: UpdateKeywordsPayload = {
      fixedKeyword: fixedKeywords, // 단수형으로 변경
      styleKeyword: styleKeywords.map((k) => ({ label: k.ko, value: k.en })), // 단수형으로 변경
      moodKeyword: moodKeywords.map((k) => ({ label: k.ko, value: k.en })), // 단수형으로 변경
    };
    updateKeywords(payload);
  };

  // --- 핸들러 함수들 ---
  const handleAddFixedKeyword = () => {
    const newKeyword = fixedKeywordInput.trim();
    if (newKeyword && !fixedKeywords.includes(newKeyword)) {
      setFixedKeywords([...fixedKeywords, newKeyword]);
      setFixedKeywordInput('');
    }
  };
  const handleFixedKeywordInputKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') handleAddFixedKeyword();
  };
  const handleRemoveFixedKeyword = (keywordToRemove: string) => {
    setFixedKeywords(fixedKeywords.filter((k) => k !== keywordToRemove));
  };

  const handleAddStyleKeyword = () => {
    const ko = styleInput.ko.trim();
    const en = styleInput.en.trim();
    if (ko && en && !styleKeywords.some((k) => k.ko === ko || k.en === en)) {
      setStyleKeywords([...styleKeywords, { ko, en }]);
      setStyleInput({ ko: '', en: '' });
    }
  };
  const handleStyleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddStyleKeyword();
  };
  const handleRemoveStyleKeyword = (keywordToRemove: KeywordPair) => {
    setStyleKeywords(styleKeywords.filter((k) => k.ko !== keywordToRemove.ko));
  };

  const handleAddMoodKeyword = () => {
    const ko = moodInput.ko.trim();
    const en = moodInput.en.trim();
    if (ko && en && !moodKeywords.some((k) => k.ko === ko || k.en === en)) {
      setMoodKeywords([...moodKeywords, { ko, en }]);
      setMoodInput({ ko: '', en: '' });
    }
  };
  const handleMoodInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddMoodKeyword();
  };
  const handleRemoveMoodKeyword = (keywordToRemove: KeywordPair) => {
    setMoodKeywords(moodKeywords.filter((k) => k.ko !== keywordToRemove.ko));
  };

  if (isPending) {
    return (
      <div className="w-[640px] p-10 text-center">
        키워드 목록을 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-[640px] p-10 text-center text-red-500">
        키워드를 불러오는 데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="w-[640px]">
      <header className="flex justify-between items-center pb-10">
        <h2 className="font-semibold text-[24px] ">키워드 변경하기</h2>
        <button
          className="size-9 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg"
          onClick={() => closeDialog()}
        >
          <Icon.X className="size-7 " />
        </button>
      </header>
      <section className="flex flex-col gap-[50px] pb-10">
        {/* 고정 키워드 */}
        <div>
          <h3 className="font-semibold text-[20px] pb-6">고정 키워드</h3>
          <div className="flex items-center gap-2 pb-5">
            <Input
              type="text"
              className="flex-1"
              value={fixedKeywordInput}
              onChange={(e) => setFixedKeywordInput(e.target.value)}
              onKeyDown={handleFixedKeywordInputKeyDown}
              placeholder="고정 키워드를 입력하세요"
            />
            <AdminButton
              variants="secondary"
              disabled={fixedKeywordInput.trim().length === 0}
              onClick={handleAddFixedKeyword}
            >
              추가
            </AdminButton>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {fixedKeywords.map((keyword) => (
              <KeywordLabel
                key={keyword}
                onDelete={() => handleRemoveFixedKeyword(keyword)}
              >
                {keyword}
              </KeywordLabel>
            ))}
          </div>
        </div>
        {/* STYLE */}
        <div>
          <h3 className="font-semibold text-[20px] pb-6">STYLE</h3>
          <div className="flex items-center gap-2 pb-5">
            <Input
              type="text"
              className="flex-1"
              placeholder="한글"
              value={styleInput.ko}
              onChange={(e) =>
                setStyleInput({ ...styleInput, ko: e.target.value })
              }
              onKeyDown={handleStyleInputKeyDown}
            />
            <Input
              type="text"
              className="flex-1"
              placeholder="영어"
              value={styleInput.en}
              onChange={(e) =>
                setStyleInput({ ...styleInput, en: e.target.value })
              }
              onKeyDown={handleStyleInputKeyDown}
            />
            <AdminButton
              variants="secondary"
              disabled={!styleInput.ko.trim() || !styleInput.en.trim()}
              onClick={handleAddStyleKeyword}
            >
              추가
            </AdminButton>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {styleKeywords.map((keyword) => (
              <KeywordLabel
                key={keyword.ko}
                onDelete={() => handleRemoveStyleKeyword(keyword)}
              >
                {`${keyword.ko} (${keyword.en})`}
              </KeywordLabel>
            ))}
          </div>
        </div>
        {/* MOOD */}
        <div>
          <h3 className="font-semibold text-[20px] pb-6">MOOD</h3>
          <div className="flex items-center gap-2 pb-5">
            <Input
              type="text"
              className="flex-1"
              placeholder="한글"
              value={moodInput.ko}
              onChange={(e) =>
                setMoodInput({ ...moodInput, ko: e.target.value })
              }
              onKeyDown={handleMoodInputKeyDown}
            />
            <Input
              type="text"
              className="flex-1"
              placeholder="영어"
              value={moodInput.en}
              onChange={(e) =>
                setMoodInput({ ...moodInput, en: e.target.value })
              }
              onKeyDown={handleMoodInputKeyDown}
            />
            <AdminButton
              variants="secondary"
              disabled={!moodInput.ko.trim() || !moodInput.en.trim()}
              onClick={handleAddMoodKeyword}
            >
              추가
            </AdminButton>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {moodKeywords.map((keyword) => (
              <KeywordLabel
                key={keyword.ko}
                onDelete={() => handleRemoveMoodKeyword(keyword)}
              >
                {`${keyword.ko} (${keyword.en})`}
              </KeywordLabel>
            ))}
          </div>
        </div>
      </section>
      <div className="flex gap-3">
        <AdminButton
          className="flex-1"
          variants="outline"
          size={50}
          onClick={() => closeDialog()}
        >
          취소
        </AdminButton>
        <AdminButton
          className="inline-flex items-center justify-center gap-2 flex-1"
          size={50}
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isPending && <Icon.LoaderCircle className="animate-spin" />}
          저장하기
        </AdminButton>
      </div>
    </div>
  );
};

export default KeywordManagerModal;
