// LocalStorage 키 및 할 일 목록 상태
const STORAGE_KEY = 'todo_list_items';
let todos = [];
let currentFilter = 'all';
let editingId = null;

// LocalStorage에서 할 일 목록 불러오기
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('할 일 목록을 불러오지 못했습니다:', e);
    todos = [];
  }
}

// LocalStorage에 할 일 목록 저장하기
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('할 일 목록을 저장하지 못했습니다:', e);
  }
}

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const emptyState = document.getElementById('empty-state');
const dateDisplay = document.getElementById('date-display');
const filterBtns = document.querySelectorAll('.filter-btn');

// 오늘 날짜 표시
function renderDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  dateDisplay.textContent = now.toLocaleDateString('ko-KR', options);
}

// 화면 렌더링
function renderTodos() {
  todoList.innerHTML = '';

  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filteredTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'todo-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    leftDiv.appendChild(checkbox);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'todo-actions';

    if (editingId === todo.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = todo.text;

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveEdit(todo.id, editInput.value);
        } else if (e.key === 'Escape') {
          cancelEdit();
        }
      });

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'action-btn save-btn';
      saveBtn.textContent = '저장';
      saveBtn.addEventListener('click', () => saveEdit(todo.id, editInput.value));

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'action-btn cancel-btn';
      cancelBtn.textContent = '취소';
      cancelBtn.addEventListener('click', () => cancelEdit());

      leftDiv.appendChild(editInput);
      actionsDiv.appendChild(saveBtn);
      actionsDiv.appendChild(cancelBtn);

      // 렌더링 직후 입력창에 포커스 및 커서를 끝으로 이동
      setTimeout(() => {
        editInput.focus();
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
      }, 0);
    } else {
      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;
      span.title = '더블 클릭하여 수정';
      span.addEventListener('dblclick', () => startEdit(todo.id));

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'action-btn edit-btn';
      editBtn.textContent = '수정';
      editBtn.addEventListener('click', () => startEdit(todo.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      leftDiv.appendChild(span);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
    }

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);

    todoList.appendChild(li);
  });

  // 남은 할 일 개수 업데이트
  const activeCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `남은 할 일 ${activeCount}개`;
}

// 할 일 추가
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTodo = {
    id: Date.now(),
    text: trimmed,
    completed: false,
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
}

// 완료 상태 토글
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

// 할 일 삭제
function deleteTodo(id) {
  if (editingId === id) editingId = null;
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 할 일 수정 모드 진입
function startEdit(id) {
  editingId = id;
  renderTodos();
}

// 할 일 수정 저장
function saveEdit(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    cancelEdit();
    return;
  }

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
  editingId = null;
  saveTodos();
  renderTodos();
}

// 할 일 수정 취소
function cancelEdit() {
  editingId = null;
  renderTodos();
}

// 이벤트 리스너 등록
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// 초기 실행
loadTodos();
renderDate();
renderTodos();

