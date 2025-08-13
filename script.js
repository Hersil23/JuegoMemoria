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
          document.dispatchEvent(new CustomEvent('resetTurn'));
        } else {
          setTimeout(() => {
            closeCard(firstCard);
            closeCard(secondCard);
            document.dispatchEvent(new CustomEvent('resetTurn'));
          }, 1000);
        }
      });

      document.addEventListener('resetTurn', () => {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
        switchTurn();
      });

      function switchTurn() {
        turn = turn === 'user' ? 'computer' : 'user';
        document.getElementById('turn').textContent = `Turno: ${turn === 'user' ? 'Usuario' : 'Computadora'}`;

        if (turn === 'computer') {
          setTimeout(() => document.dispatchEvent(new CustomEvent('computerPlay')), 1500);
        }
      }

      document.addEventListener('computerPlay', () => {
        const availableCards = [...cards].filter(card => !card.classList.contains('open') && !card.classList.contains('matched'));
        if (availableCards.length < 2) return;

        const [card1, card2] = availableCards.sort(() => 0.5 - Math.random()).slice(0, 2);
        openCard(card1);
        firstCard = card1;

        setTimeout(() => {
          openCard(card2);
          secondCard = card2;
          lockBoard = true;
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
    });