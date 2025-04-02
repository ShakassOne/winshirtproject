import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockLotteries, mockProducts } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';
import { useAuth } from '@/contexts/AuthContext';
import { LotteryParticipation } from '@/types/lottery';
import { Order } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info, Eye, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InvoiceModal from '@/components/admin/orders/InvoiceModal';
import { generateAndStoreInvoiceUrl } from '@/utils/invoiceGenerator';
import { toast } from '@/lib/toast';

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  
  // État pour les participations et commandes de l'utilisateur
  const [userParticipations, setUserParticipations] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    if (user) {
      // Récupérer les participations de l'utilisateur
      const participationsString = localStorage.getItem('participations');
      if (participationsString) {
        try {
          const allParticipations = JSON.parse(participationsString) as LotteryParticipation[];
          // Filtrer les participations pour obtenir uniquement celles de l'utilisateur connecté
          const userParticipationsList = allParticipations.filter(p => p.userId === user.id);
          
          // Ajouter les détails de la loterie et du produit à chaque participation
          const enrichedParticipations = userParticipationsList.map(participation => {
            const lotteriesString = localStorage.getItem('lotteries');
            const productsString = localStorage.getItem('products');
            
            const lotteries = lotteriesString ? JSON.parse(lotteriesString) : mockLotteries;
            const products = productsString ? JSON.parse(productsString) : mockProducts;
            
            const lottery = lotteries.find((l: any) => l.id === participation.lotteryId);
            const product = products.find((p: any) => p.id === participation.productId);
            
            return {
              ...participation,
              lottery,
              product,
            };
          });
          
          setUserParticipations(enrichedParticipations);
        } catch (error) {
          console.error("Erreur lors du chargement des participations:", error);
          setUserParticipations([]);
        }
      } else {
        setUserParticipations([]);
      }
      
      // Récupérer les commandes de l'utilisateur
      const ordersString = localStorage.getItem('orders');
      if (ordersString) {
        try {
          const allOrders = JSON.parse(ordersString) as Order[];
          // Filtrer les commandes pour obtenir uniquement celles de l'utilisateur connecté
          const userOrdersList = allOrders.filter(o => o.clientId === user.id) as Order[];
          setUserOrders(userOrdersList);
        } catch (error) {
          console.error("Erreur lors du chargement des commandes:", error);
          setUserOrders([]);
        }
      } else {
        setUserOrders([]);
      }
    }
  }, [user]);
  
  if (!user) {
    return <div className="pt-32 pb-16 text-center">Chargement...</div>;
  }
  
  const handleGenerateInvoice = (order: Order) => {
    // Vérifier si la facture existe déjà
    if (!order.invoiceUrl) {
      // Générer et stocker l'URL de la facture
      const updatedOrder = generateAndStoreInvoiceUrl(order);
      
      // Mettre à jour l'ordre dans la liste
      const updatedOrders = userOrders.map(o => 
        o.id === updatedOrder.id ? updatedOrder : o
      );
      
      setUserOrders(updatedOrders);
      
      // Mettre à jour dans le localStorage
      const ordersString = localStorage.getItem('orders');
      if (ordersString) {
        try {
          const allOrders = JSON.parse(ordersString) as Order[];
          const updatedAllOrders = allOrders.map(o => 
            o.id === updatedOrder.id ? updatedOrder : o
          );
          localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
        } catch (error) {
          console.error("Erreur lors de la mise à jour des commandes:", error);
        }
      }
      
      // Ouvrir le modal avec l'ordre mis à jour
      setInvoiceOrder(updatedOrder);
    } else {
      // Ouvrir directement le modal car la facture existe déjà
      setInvoiceOrder(order);
    }
    
    toast.success("Facture générée avec succès");
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              {user.profilePicture && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-winshirt-purple">
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{user.name}</h1>
                  {user.socialMediaDetails?.isVerified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2 className="text-blue-400 h-6 w-6" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compte vérifié</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-gray-300">Membre depuis {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
                {user.provider && (
                  <Badge className={`mt-2 ${user.provider === 'facebook' ? 'bg-[#1877F2]' : user.provider === 'google' ? 'bg-[#DB4437]' : 'bg-winshirt-purple'}`}>
                    {user.provider === 'facebook' ? 'Connecté via Facebook' : 
                     user.provider === 'google' ? 'Connecté via Google' : 'Inscrit par email'}
                  </Badge>
                )}
              </div>
            </div>
            <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
              Modifier mon profil
            </Button>
          </div>
          
          <Tabs defaultValue="participations" className="w-full">
            <TabsList className="mb-8 bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="participations" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Mes Participations
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Mes Commandes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Paramètres du compte
              </TabsTrigger>
            </TabsList>
            
            {/* Participations Tab */}
            <TabsContent value="participations">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Vos tickets de loterie</h2>
                
                {userParticipations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userParticipations.map((participation) => (
                      <Card key={participation.id} className="winshirt-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">
                            Ticket #{participation.ticketNumber}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-md overflow-hidden">
                              <img 
                                src={participation.lottery?.image} 
                                alt={participation.lottery?.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-winshirt-blue-light font-medium">
                                {participation.lottery?.title}
                              </h3>
                              <p className="text-sm text-gray-300 mb-1">
                                Produit: {participation.product?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Date de participation: {new Date(participation.date).toLocaleDateString('fr-FR')}
                              </p>
                              
                              <div className="mt-2 flex items-center">
                                <span className={`text-xs py-1 px-2 rounded-full
                                  ${participation.lottery?.status === 'active' 
                                    ? 'bg-winshirt-space-light text-winshirt-purple-light' 
                                    : participation.lottery?.status === 'completed' 
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-blue-900/30 text-blue-400'
                                  }`}>
                                  {participation.lottery?.status === 'active' 
                                    ? 'En cours' 
                                    : participation.lottery?.status === 'completed' 
                                      ? 'Terminée'
                                      : 'Relancée'
                                  }
                                </span>
                                
                                {participation.lottery?.winner && (
                                  <span className="text-xs ml-2 text-yellow-400">
                                    {participation.lottery.winner.email === user.email 
                                      ? '🎉 Vous avez gagné!'
                                      : 'Gagnant désigné'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="winshirt-card p-6 text-center">
                    <p className="text-gray-300 mb-4">Vous n'avez pas encore de participation à une loterie.</p>
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Découvrir nos loteries
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Historique des commandes</h2>
                
                {userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <Card key={order.id} className="winshirt-card">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-medium text-white mb-1">Commande #{order.id}</h3>
                              <p className="text-sm text-gray-300">Date: {new Date(order.orderDate).toLocaleDateString('fr-FR')}</p>
                              <p className="text-sm text-gray-300">{order.items.length} article(s)</p>
                            </div>
                            
                            <div className="flex flex-col md:items-end justify-between">
                              <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm 
                                  ${order.status === 'delivered' 
                                    ? 'bg-green-900/30 text-green-400' 
                                    : order.status === 'processing'
                                    ? 'bg-blue-900/30 text-blue-400'
                                    : 'bg-purple-900/30 text-purple-400'
                                  }`}>
                                  {order.status === 'delivered' 
                                    ? 'Livrée' 
                                    : order.status === 'processing'
                                    ? 'En traitement'
                                    : order.status}
                                </span>
                                <p className="mt-1 text-winshirt-purple-light font-medium">
                                  {order.total.toFixed(2)} €
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                <Button 
                                  variant="ghost" 
                                  className="text-winshirt-blue-light hover:bg-winshirt-blue/10"
                                  onClick={() => setSelectedOrderDetails(order)}
                                >
                                  <Eye size={16} className="mr-2" />
                                  Voir les détails
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  className="text-winshirt-purple-light hover:bg-winshirt-purple/10"
                                  onClick={() => handleGenerateInvoice(order)}
                                >
                                  <FileText size={16} className="mr-2" />
                                  Facture
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="winshirt-card p-6 text-center">
                    <p className="text-gray-300 mb-4">Vous n'avez pas encore passé de commande.</p>
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Découvrir nos T-shirts
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Nom</p>
                        <p className="text-gray-300">{user.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-gray-300">{user.email}</p>
                      </div>
                      
                      {user.socialMediaDetails && (
                        <>
                          {user.socialMediaDetails.firstName && (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Prénom</p>
                              <p className="text-gray-300">{user.socialMediaDetails.firstName}</p>
                            </div>
                          )}
                          
                          {user.socialMediaDetails.lastName && (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Nom de famille</p>
                              <p className="text-gray-300">{user.socialMediaDetails.lastName}</p>
                            </div>
                          )}
                          
                          {user.provider && (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Méthode de connexion</p>
                              <p className="text-gray-300 flex items-center gap-2">
                                {user.provider === 'facebook' ? (
                                  <>
                                    <span className="inline-block w-4 h-4 bg-[#1877F2] rounded-sm"></span>
                                    Facebook
                                  </>
                                ) : user.provider === 'google' ? (
                                  <>
                                    <span className="inline-block w-4 h-4 bg-[#DB4437] rounded-sm"></span>
                                    Google
                                  </>
                                ) : (
                                  'Email'
                                )}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Modifier mes informations
                    </Button>
                  </div>
                  
                  <Separator className="my-6 bg-winshirt-purple/20" />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Sécurité</h3>
                    <p className="text-gray-300">Modifiez votre mot de passe ou les paramètres de sécurité</p>
                    
                    {user.provider === 'google' && (
                      <div className="mt-3 p-3 bg-green-900/30 border border-green-600/30 rounded-md">
                        <p className="text-green-400 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Authentification en deux étapes activée via Google
                        </p>
                      </div>
                    )}
                    
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Changer de mot de passe
                    </Button>
                  </div>
                  
                  <Separator className="my-6 bg-winshirt-purple/20" />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Préférences de notification</h3>
                    <p className="text-gray-300">Gérez vos préférences d'email et de notifications</p>
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Gérer les notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Modal de facture */}
      {invoiceOrder && (
        <InvoiceModal 
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
      
      {/* Détails de la commande - Nous pourrions créer un composant séparé pour cela plus tard */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="winshirt-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Commande #{selectedOrderDetails.id}</h2>
              <Button variant="ghost" className="text-gray-400" onClick={() => setSelectedOrderDetails(null)}>
                ✕
              </Button>
            </div>
            
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">Informations</h3>
                  <p className="text-gray-300">Date: {new Date(selectedOrderDetails.orderDate).toLocaleDateString('fr-FR')}</p>
                  <p className="text-gray-300">Statut: <span className={`
                    ${selectedOrderDetails.status === 'delivered' ? 'text-green-400' : 
                      selectedOrderDetails.status === 'processing' ? 'text-blue-400' : 
                      'text-purple-400'}
                  `}>{selectedOrderDetails.status}</span></p>
                  <p className="text-gray-300 mt-2">Méthode de paiement: {selectedOrderDetails.payment.method}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">Livraison</h3>
                  <p className="text-white">{selectedOrderDetails.shipping.address}</p>
                  <p className="text-white">{selectedOrderDetails.shipping.postalCode}, {selectedOrderDetails.shipping.city}</p>
                  <p className="text-white">{selectedOrderDetails.shipping.country}</p>
                  <p className="text-gray-300 mt-2">Méthode: {selectedOrderDetails.shipping.method}</p>
                  {selectedOrderDetails.delivery?.trackingNumber && (
                    <p className="text-winshirt-blue-light mt-1">
                      Suivi: {selectedOrderDetails.delivery.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-3">Articles</h3>
                <div className="space-y-3">
                  {selectedOrderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between border-b border-winshirt-purple/10 pb-3">
                      <div className="flex gap-3">
                        {item.productImage && (
                          <div className="w-16 h-16 rounded overflow-hidden">
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{item.productName}</p>
                          <p className="text-gray-400 text-sm">
                            {item.size && `Taille: ${item.size}`} 
                            {item.color && ` | Couleur: ${item.color}`}
                          </p>
                          <p className="text-gray-400 text-sm">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="text-gray-300">Sous-total: <span className="text-white">{selectedOrderDetails.subtotal.toFixed(2)} €</span></p>
                <p className="text-gray-300">Frais de livraison: <span className="text-white">{selectedOrderDetails.shipping.cost.toFixed(2)} €</span></p>
                <p className="text-winshirt-purple-light font-bold text-lg mt-1">Total: {selectedOrderDetails.total.toFixed(2)} €</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  className="border-winshirt-purple text-winshirt-purple-light"
                  onClick={() => setSelectedOrderDetails(null)}
                >
                  Fermer
                </Button>
                
                <Button 
                  className="bg-winshirt-purple hover:bg-winshirt-purple-dark flex items-center gap-2"
                  onClick={() => {
                    handleGenerateInvoice(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                >
                  <FileText size={16} />
                  Voir la facture
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountPage;
