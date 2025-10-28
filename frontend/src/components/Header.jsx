import Logo from './Logo';

function Header({ children, showLogo = true }) {
  return (
    <header className="w-full mb-6">
      {showLogo && (
        <div className="flex items-center justify-center mb-4">
          <Logo size="large" showText={true} interactive={true} />
        </div>
      )}
      {children}
    </header>
  );
}

export default Header;

