export default function Register({ onChanges, userName, onClicks }) {
  return (
    <div className="register">
      <input
        type="text"
        value={userName}
        onChange={(event) => onChanges(event)}
        placeholder="Enter your Username"
      />

      <button onClick={onClicks}>Register</button>
    </div>
  );
}
