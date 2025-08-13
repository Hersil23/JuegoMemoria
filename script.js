document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let turn = 'user';

  // Estilo inicial con Tailwind
  cards.forEach(card => {
    card.className = "card w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-3xl cursor-pointer transition duration-300 hover:bg-blue-600";
    card.textContent = '';
    card.addEventListener('click', () => {
      if (turn !== 'user') return;
      handleCardClick(card);
    });
  });

  function handleCardClick(card) {
    if (lockBoard || card.classList.contains('open') || card.classList.contains('matched')) return;

    openCard(card);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    document.dispatchEvent(new CustomEvent('checkMatch'));
  }

  document.addEventListener('checkMatch', () => {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');

      // Registrar quién hizo el par
      firstCard.dataset.owner = turn;
      secondCard.dataset.owner = turn;

      document.dispatchEvent(new CustomEvent('resetTurn'));
    } else {
      setTimeout(() => {
        closeCard(firstCard);
        closeCard(secondCard);
        document.dispatchEvent(new CustomEvent('resetTurn'));
      }, 1000);
    }

    // Verificar si terminó el juego
    const matchedCards = document.querySelectorAll('.matched');
    if (matchedCards.length === cards.length) {
      const userPairs = [...matchedCards].filter(card => card.dataset.owner === 'user').length;
      const computerPairs = [...matchedCards].filter(card => card.dataset.owner === 'computer').length;

      let winner = '';
      if (userPairs > computerPairs) {
        winner = '¡Ganó el Usuario!';
      } else if (computerPairs > userPairs) {
        winner = '¡Ganó la Computadora!';
      } else {
        winner = '¡Empate!';
      }

      setTimeout(() => {
        alert(`Fin del juego. ${winner}`);
        resetGame(); // Reiniciar el juego
      }, 500);
    }
  });

  document.addEventListener('resetTurn', () => {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
    switchTurn();
  });

  function switchTurn() {
    turn = turn === 'user' ? 'computer' : 'user';
    const turnElement = document.getElementById('turn');
    if (turnElement) {
      turnElement.textContent = `Turno: ${turn === 'user' ? 'Usuario' : 'Computadora'}`;
    }

    if (turn === 'computer') {
      setTimeout(() => document.dispatchEvent(new CustomEvent('computerPlay')), 1500);
    }
  }

  document.addEventListener('computerPlay', () => {
    lockBoard = true;
    const availableCards = [...cards].filter(card => !card.classList.contains('open') && !card.classList.contains('matched'));
    if (availableCards.length < 2) {
      lockBoard = false;
      return;
    }

    const [card1, card2] = availableCards.sort(() => 0.5 - Math.random()).slice(0, 2);
    openCard(card1);
    firstCard = card1;

    setTimeout(() => {
      openCard(card2);
      secondCard = card2;
      document.dispatchEvent(new CustomEvent('checkMatch'));
    }, 1000);
  });

  function openCard(card) {
    card.classList.add('open');
    card.textContent = card.dataset.value;
    card.classList.remove('bg-gray-700');
    card.classList.add('bg-blue-500');
  }

  function closeCard(card) {
    card.classList.remove('open');
    card.textContent = '';
    card.classList.remove('bg-blue-500');
    card.classList.add('bg-gray-700');
  }

  function resetGame() {
    // Ocultar y limpiar todas las cartas
    cards.forEach(card => {
      card.classList.remove('open', 'matched');
      card.textContent = '';
      card.classList.remove('bg-blue-500');
      card.classList.add('bg-gray-700');
      delete card.dataset.owner;
    });

    // Mezclar los valores de las cartas
    const values = [...cards].map(card => card.dataset.value);
    const shuffledValues = values.sort(() => 0.5 - Math.random());

    cards.forEach((card, index) => {
      card.dataset.value = shuffledValues[index];
    });

    // Reiniciar estado del juego
    firstCard = null;
    const turnElement = document.getElementById('turn');
    if (turnElement) {
      turnElement.textContent = 'Turno: Usuario';
    }
    lockBoard = false;
    turn = 'user';
    document.getElementById('turn').textContent = 'Turno: Usuario';
  }
});