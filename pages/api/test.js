export default function handler(req, res) {
  console.log('Test API wurde aufgerufen!');
  res.status(200).json({ message: 'API funktioniert!' });
}