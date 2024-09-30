// src/pages/ManageGolfScores.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 20px;
  background-color: #0d1e12;
  color: #ffffff;
  min-height: 100vh;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-bottom: 10px;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #9ccd8d;
  font-size: 20px;
  cursor: pointer;
`;

const Title = styled.h2`
  font-size: 18px;
  color: #9ccd8d;
`;

const AddButton = styled.button`
  background-color: #a5d337;
  color: #0d1e12;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #94c32b;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const TableHeader = styled.th`
  background-color: #213829;
  color: #9ccd8d;
  padding: 10px;
  border-bottom: 1px solid #4a4a4a;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #1a2d23;
  }

  &:hover {
    background-color: #2a3d33;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #4a4a4a;
  text-align: center;
  color: #ffffff;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #a5d337;
  cursor: pointer;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1a2d23;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  min-width: 100%;
  box-sizing: border-box;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #a5d337;
  color: #0d1e12;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #94c32b;
  }
`;

const DeleteButtonModal = styled.button`
  background-color: #d94c4c;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;

  &:hover {
    background-color: #c43b3b;
  }
`;

const InputField = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
`;

const ScrollablePicker = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 200px;
  padding: 15px;
  background-color: #213829;
  border-radius: 10px;
  width: 80px;
  margin: 0 5px;
`;

const PickerColumn = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const PickerItem = styled.div<{ isSelected: boolean }>`
  padding: 10px 0;
  color: ${(props) => (props.isSelected ? '#a5d337' : '#ffffff')};
  cursor: pointer;
  font-size: 18px;

  &:hover {
    color: #a5d337;
  }
`;

const ManageGolfScores = () => {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const [scores, setScores] = useState<{ score: string; date: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<{ score: string; date: string }>({
    score: '',
    date: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchScores = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setScores(data.scores || []);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [currentUser]);

  const handleEdit = (index: number) => {
    setCurrentScore(scores[index]);
    setEditingIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = () => {
    if (editingIndex === null) return;
    const updatedScores = scores.filter((_, idx) => idx !== editingIndex);
    setScores(updatedScores);
    saveScores(updatedScores);
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const isValidDate = (dateString: string): boolean => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const handleSave = () => {
    // Reset previous errors
    setError('');

    // Validate score
    const scoreNumber = Number(currentScore.score);
    if (isNaN(scoreNumber) || scoreNumber < 60 || scoreNumber > 150) {
      setError('스코어는 60에서 150 사이의 숫자여야 합니다.');
      return;
    }

    // Validate date
    if (!isValidDate(currentScore.date)) {
      setError('유효한 날짜를 선택해주세요.');
      return;
    }

    if (isEditing && editingIndex !== null) {
      const updatedScores = scores.map((score, idx) =>
        idx === editingIndex ? currentScore : score
      );
      setScores(updatedScores);
      saveScores(updatedScores);
    } else {
      const updatedScores = [...scores, currentScore];
      setScores(updatedScores);
      saveScores(updatedScores);
    }

    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const saveScores = async (newScores: { score: string; date: string }[]) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { scores: newScores });
    } catch (error) {
      console.error('Error saving scores:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentScore({ score: '', date: '' });
    setIsEditing(false);
    setEditingIndex(null);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentScore({ score: '', date: '' });
    setEditingIndex(null);
    setError('');
  };

  const handleDateChange = (type: string, value: string) => {
    const dateParts = currentScore.date ? currentScore.date.split('-') : ['', '', ''];
    if (type === 'year') dateParts[0] = value;
    if (type === 'month') dateParts[1] = value;
    if (type === 'day') dateParts[2] = value;

    setCurrentScore({ ...currentScore, date: dateParts.join('-') });
  };

  const selectedDateParts = currentScore.date ? currentScore.date.split('-') : ['', '', ''];

  return (
    <Wrapper>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <Title>스코어</Title>
        <AddButton onClick={openModal}>+</AddButton>
      </Header>
      <Table>
        <thead>
          <tr>
            <TableHeader>스코어</TableHeader>
            <TableHeader>날짜</TableHeader>
            <TableHeader>편집</TableHeader>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <TableRow key={index}>
              <TableCell>{score.score}</TableCell>
              <TableCell>{score.date}</TableCell>
              <TableCell>
                <EditButton onClick={() => handleEdit(index)}>✎</EditButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      {isModalOpen && (
        <ModalWrapper>
          <ModalContent>
            <ModalHeader>
              <CloseButton onClick={closeModal}>×</CloseButton>
              <div>
                <SaveButton onClick={handleSave}>저장</SaveButton>
                {isEditing && (
                  <DeleteButtonModal onClick={handleDelete}>삭제</DeleteButtonModal>
                )}
              </div>
            </ModalHeader>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <InputField>
              {/* Score Picker */}
              <ScrollablePicker>
                <PickerColumn>
                  {Array.from({ length: 91 }, (_, i) => (60 + i).toString()).map((score) => (
                    <PickerItem
                      key={score}
                      onClick={() => setCurrentScore({ ...currentScore, score })}
                      isSelected={currentScore.score === score}
                    >
                      {score}
                    </PickerItem>
                  ))}
                </PickerColumn>
              </ScrollablePicker>
              {/* Year Picker */}
              <ScrollablePicker>
                <PickerColumn>
                  {['2024', '2023', '2022'].map((year) => (
                    <PickerItem
                      key={year}
                      onClick={() => handleDateChange('year', year)}
                      isSelected={selectedDateParts[0] === year}
                    >
                      {year}
                    </PickerItem>
                  ))}
                </PickerColumn>
              </ScrollablePicker>
              {/* Month Picker */}
              <ScrollablePicker>
                <PickerColumn>
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
                    (month) => (
                      <PickerItem
                        key={month}
                        onClick={() => handleDateChange('month', month)}
                        isSelected={selectedDateParts[1] === month}
                      >
                        {month}
                      </PickerItem>
                    )
                  )}
                </PickerColumn>
              </ScrollablePicker>
              {/* Day Picker */}
              <ScrollablePicker>
                <PickerColumn>
                  {Array.from({ length: 31 }, (_, i) =>
                    (i + 1).toString().padStart(2, '0')
                  ).map((day) => (
                    <PickerItem
                      key={day}
                      onClick={() => handleDateChange('day', day)}
                      isSelected={selectedDateParts[2] === day}
                    >
                      {day}
                    </PickerItem>
                  ))}
                </PickerColumn>
              </ScrollablePicker>
            </InputField>
          </ModalContent>
        </ModalWrapper>
      )}
    </Wrapper>
  );
};

export default ManageGolfScores;